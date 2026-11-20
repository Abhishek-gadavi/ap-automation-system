from rest_framework import serializers
from .models import ApprovalMatrix, InvoiceApproval, AuditLog
from apps.invoices.serializers import InvoiceSerializer

class ApprovalMatrixSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApprovalMatrix
        fields = '__all__'

class InvoiceApprovalSerializer(serializers.ModelSerializer):
    invoice_details = InvoiceSerializer(source='invoice', read_only=True)

    class Meta:
        model = InvoiceApproval
        fields = '__all__'

class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = '__all__'
