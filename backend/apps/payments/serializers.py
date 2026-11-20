from rest_framework import serializers
from .models import PaymentRequest
from apps.invoices.serializers import InvoiceSerializer
from apps.vendors.serializers import VendorSerializer

class PaymentRequestSerializer(serializers.ModelSerializer):
    invoice_details = InvoiceSerializer(source='invoice', read_only=True)
    vendor_details = VendorSerializer(source='vendor', read_only=True)

    class Meta:
        model = PaymentRequest
        fields = '__all__'
