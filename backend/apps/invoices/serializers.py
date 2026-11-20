from rest_framework import serializers
from .models import Invoice, InvoiceLineItem, PurchaseOrder, POLineItem, GoodsReceiptNote, GRNLineItem
from apps.vendors.serializers import VendorSerializer

class POLineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = POLineItem
        fields = '__all__'

class PurchaseOrderSerializer(serializers.ModelSerializer):
    line_items = POLineItemSerializer(many=True, read_only=True)
    vendor_details = VendorSerializer(source='vendor', read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = '__all__'

class GRNLineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = GRNLineItem
        fields = '__all__'

class GoodsReceiptNoteSerializer(serializers.ModelSerializer):
    line_items = GRNLineItemSerializer(many=True, read_only=True)

    class Meta:
        model = GoodsReceiptNote
        fields = '__all__'

class InvoiceLineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceLineItem
        fields = '__all__'

class InvoiceSerializer(serializers.ModelSerializer):
    line_items = InvoiceLineItemSerializer(many=True, read_only=True)
    vendor_details = VendorSerializer(source='vendor', read_only=True)
    po_details = PurchaseOrderSerializer(source='po', read_only=True)
    grn_details = GoodsReceiptNoteSerializer(source='grn', read_only=True)

    class Meta:
        model = Invoice
        fields = '__all__'
