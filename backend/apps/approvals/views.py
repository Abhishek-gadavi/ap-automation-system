from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ApprovalMatrix, InvoiceApproval, AuditLog, ApprovalStatus
from .serializers import ApprovalMatrixSerializer, InvoiceApprovalSerializer, AuditLogSerializer
from .services.workflow_engine import WorkflowEngine
from apps.invoices.models import Invoice

class ApprovalMatrixViewSet(viewsets.ModelViewSet):
    queryset = ApprovalMatrix.objects.all()
    serializer_class = ApprovalMatrixSerializer

class InvoiceApprovalViewSet(viewsets.ModelViewSet):
    queryset = InvoiceApproval.objects.all()
    serializer_class = InvoiceApprovalSerializer

    @action(detail=False, methods=['post'])
    def initialize_workflow(self, request):
        invoice_id = request.data.get('invoice_id')
        try:
            invoice = Invoice.objects.get(id=invoice_id)
        except Invoice.DoesNotExist:
            return Response({'error': 'Invoice not found'}, status=status.HTTP_404_NOT_FOUND)

        approvals = WorkflowEngine.initialize_approvals_for_invoice(invoice)
        return Response(InvoiceApprovalSerializer(approvals, many=True).data)

    @action(detail=True, methods=['post'])
    def act(self, request, pk=None):
        """
        Decision actions: APPROVE, REJECT, CLARIFY, ESCALATE
        """
        decision = request.data.get('decision', 'APPROVE').upper()
        user_email = request.data.get('user_email', 'approver@templegate.example.com')
        role = request.data.get('role', 'Finance Approver')
        comments = request.data.get('comments', '')

        try:
            updated_approval = WorkflowEngine.process_decision(pk, user_email, role, decision, comments)
            return Response(InvoiceApprovalSerializer(updated_approval).data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
