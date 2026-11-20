"""
Configurable Workflow & Approval Engine
Manages:
- Matrix evaluation based on invoice gross amount
- Multi-tier progressive approvals (Tier 1 -> Tier 2 -> Tier 3 -> Tier 4)
- SLA monitoring & Escalations (>48 hrs)
- Parallel approvals routing
- Full audit logging
"""

from django.utils import timezone
from datetime import timedelta
from apps.approvals.models import ApprovalMatrix, InvoiceApproval, ApprovalStatus, AuditLog
from apps.invoices.models import Invoice, InvoiceStatus

class WorkflowEngine:

    @classmethod
    def initialize_approvals_for_invoice(cls, invoice):
        """
        Calculates tiers based on approval_matrix table and creates required pending approval nodes.
        """
        amount = invoice.total_amount
        # Fetch matching matrix tiers
        eligible_tiers = ApprovalMatrix.objects.filter(
            is_active=True,
            min_amount__lte=amount
        ).order_by('tier_level')

        created_approvals = []
        for tier in eligible_tiers:
            approval, _ = InvoiceApproval.objects.get_or_create(
                invoice=invoice,
                tier_level=tier.tier_level,
                defaults={
                    'approver_role': tier.role_name,
                    'status': ApprovalStatus.PENDING
                }
            )
            created_approvals.append(approval)

        AuditLog.objects.create(
            entity_type='INVOICE',
            entity_id=invoice.id,
            action='APPROVAL_WORKFLOW_INITIALIZED',
            performed_by='SYSTEM_WORKFLOW_ENGINE',
            details=f"Initialized {len(created_approvals)} approval tier(s) for invoice amount ₹{amount:,.2f}."
        )

        return created_approvals

    @classmethod
    def process_decision(cls, approval_id, user_email, role, decision, comments=None):
        approval = InvoiceApproval.objects.get(id=approval_id)
        invoice = approval.invoice

        approval.approver_email = user_email
        approval.comments = comments
        approval.decision_at = timezone.now()

        if decision == 'APPROVE':
            approval.status = ApprovalStatus.APPROVED
            approval.save()

            # Check if all tiers approved
            pending_tiers = invoice.approvals.filter(status=ApprovalStatus.PENDING)
            if not pending_tiers.exists():
                invoice.status = InvoiceStatus.APPROVED
                invoice.save()
                AuditLog.objects.create(
                    entity_type='INVOICE',
                    entity_id=invoice.id,
                    action='INVOICE_FULLY_APPROVED',
                    performed_by=user_email,
                    details=f"All approval tiers satisfied. Invoice ready for payment scheduling."
                )
            else:
                AuditLog.objects.create(
                    entity_type='INVOICE',
                    entity_id=invoice.id,
                    action=f'TIER_{approval.tier_level}_APPROVED',
                    performed_by=user_email,
                    details=f"Approved by {role} ({user_email}). Progressing to next tier."
                )

        elif decision == 'REJECT':
            approval.status = ApprovalStatus.REJECTED
            approval.save()
            invoice.status = InvoiceStatus.REJECTED
            invoice.save()

            AuditLog.objects.create(
                entity_type='INVOICE',
                entity_id=invoice.id,
                action='INVOICE_REJECTED',
                performed_by=user_email,
                details=f"Rejected at Tier {approval.tier_level} by {role}. Reason: {comments}"
            )

        elif decision == 'CLARIFY':
            approval.status = ApprovalStatus.CLARIFICATION_REQUESTED
            approval.save()
            AuditLog.objects.create(
                entity_type='INVOICE',
                entity_id=invoice.id,
                action='CLARIFICATION_REQUESTED',
                performed_by=user_email,
                details=f"Clarification query raised by {role}: {comments}"
            )

        elif decision == 'ESCALATE':
            approval.status = ApprovalStatus.ESCALATED
            approval.escalated_to = 'cfo@templegate.example.com'
            approval.save()
            AuditLog.objects.create(
                entity_type='INVOICE',
                entity_id=invoice.id,
                action='SLA_ESCALATED',
                performed_by=user_email,
                details=f"Approval escalated to CFO due to SLA expiry or complexity."
            )

        return approval
