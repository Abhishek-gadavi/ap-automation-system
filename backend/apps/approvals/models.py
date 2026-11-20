import uuid
from django.db import models
from apps.invoices.models import Invoice

class ApprovalStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    APPROVED = 'APPROVED', 'Approved'
    REJECTED = 'REJECTED', 'Rejected'
    ESCALATED = 'ESCALATED', 'Escalated'
    CLARIFICATION_REQUESTED = 'CLARIFICATION_REQUESTED', 'Clarification Requested'

class ApprovalMatrix(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tier_level = models.IntegerField()
    role_name = models.CharField(max_length=100)
    min_amount = models.DecimalField(max_digits=15, decimal_places=2)
    max_amount = models.DecimalField(max_digits=15, decimal_places=2)
    requires_parallel_approval = models.BooleanField(default=False)
    sla_hours = models.IntegerField(default=48)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'approval_matrix'
        ordering = ['tier_level']

    def __str__(self):
        return f"Tier {self.tier_level}: {self.role_name} (₹{self.min_amount:,.2f} - ₹{self.max_amount:,.2f})"

class InvoiceApproval(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='approvals')
    tier_level = models.IntegerField()
    approver_role = models.CharField(max_length=100)
    approver_email = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=32, choices=ApprovalStatus.choices, default=ApprovalStatus.PENDING)
    comments = models.TextField(null=True, blank=True)
    escalated_to = models.CharField(max_length=255, null=True, blank=True)
    decision_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'invoice_approvals'
        ordering = ['tier_level']

class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    entity_type = models.CharField(max_length=64)
    entity_id = models.UUIDField()
    action = models.CharField(max_length=64)
    performed_by = models.CharField(max_length=255)
    ip_address = models.CharField(max_length=45, null=True, blank=True)
    old_state = models.JSONField(null=True, blank=True)
    new_state = models.JSONField(null=True, blank=True)
    details = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'audit_logs'
        ordering = ['-created_at']
