import uuid
from django.db import models
from apps.vendors.models import Vendor

class InvoiceStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Draft'
    UPLOADED = 'UPLOADED', 'Uploaded'
    PROCESSING_OCR = 'PROCESSING_OCR', 'Processing OCR'
    EXTRACTED = 'EXTRACTED', 'Extracted'
    VALIDATION_FAILED = 'VALIDATION_FAILED', 'Validation Failed'
    PENDING_MATCHING = 'PENDING_MATCHING', 'Pending Matching'
    MATCHING_FAILED = 'MATCHING_FAILED', 'Matching Failed'
    PENDING_APPROVAL = 'PENDING_APPROVAL', 'Pending Approval'
    APPROVED = 'APPROVED', 'Approved'
    REJECTED = 'REJECTED', 'Rejected'
    PAYMENT_SCHEDULED = 'PAYMENT_SCHEDULED', 'Payment Scheduled'
    PAID = 'PAID', 'Paid'
    CANCELLED = 'CANCELLED', 'Cancelled'

class MatchingType(models.TextChoices):
    TWO_WAY = 'TWO_WAY', '2-Way (PO vs Invoice)'
    THREE_WAY = 'THREE_WAY', '3-Way (PO vs GRN vs Invoice)'

class MatchStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending Match'
    MATCHED_EXACT = 'MATCHED_EXACT', 'Matched Exact'
    MATCHED_WITHIN_TOLERANCE = 'MATCHED_WITHIN_TOLERANCE', 'Matched Within Tolerance'
    DISCREPANCY_PRICE = 'DISCREPANCY_PRICE', 'Discrepancy in Unit Price'
    DISCREPANCY_QTY = 'DISCREPANCY_QTY', 'Discrepancy in Quantity'
    DISCREPANCY_TOTAL = 'DISCREPANCY_TOTAL', 'Discrepancy in Total Amount'
    MANUALLY_OVERRIDDEN = 'MANUALLY_OVERRIDDEN', 'Manually Overridden'

# Purchase Orders
class PurchaseOrder(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    po_number = models.CharField(max_length=64, unique=True)
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='purchase_orders')
    po_date = models.DateField()
    delivery_date = models.DateField(null=True, blank=True)
    currency = models.CharField(max_length=3, default='INR')
    subtotal = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    tax_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    status = models.CharField(max_length=32, default='OPEN')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'purchase_orders'

    def __str__(self):
        return f"{self.po_number} ({self.vendor.name})"

class POLineItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    po = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='line_items')
    item_code = models.CharField(max_length=64)
    description = models.TextField()
    quantity = models.DecimalField(max_digits=12, decimal_places=3)
    unit_of_measure = models.CharField(max_length=16, default='NOS')
    unit_price = models.DecimalField(max_digits=15, decimal_places=2)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=18.00)
    tax_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    total_price = models.DecimalField(max_digits=15, decimal_places=2)

    class Meta:
        db_table = 'po_line_items'

# Goods Receipt Notes (GRN)
class GoodsReceiptNote(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    grn_number = models.CharField(max_length=64, unique=True)
    po = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='grns')
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE)
    received_date = models.DateField()
    received_by = models.CharField(max_length=150, blank=True, null=True)
    warehouse_code = models.CharField(max_length=50, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'goods_receipt_notes'

    def __str__(self):
        return f"{self.grn_number} (PO: {self.po.po_number})"

class GRNLineItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    grn = models.ForeignKey(GoodsReceiptNote, on_delete=models.CASCADE, related_name='line_items')
    po_line_item = models.ForeignKey(POLineItem, on_delete=models.SET_NULL, null=True, blank=True)
    item_code = models.CharField(max_length=64)
    quantity_received = models.DecimalField(max_digits=12, decimal_places=3)
    quantity_accepted = models.DecimalField(max_digits=12, decimal_places=3)
    quantity_rejected = models.DecimalField(max_digits=12, decimal_places=3, default=0.000)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'grn_line_items'

# Invoices
class Invoice(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice_number = models.CharField(max_length=100, blank=True, null=True)
    vendor = models.ForeignKey(Vendor, on_delete=models.SET_NULL, null=True, blank=True, related_name='invoices')
    po = models.ForeignKey(PurchaseOrder, on_delete=models.SET_NULL, null=True, blank=True, related_name='invoices')
    grn = models.ForeignKey(GoodsReceiptNote, on_delete=models.SET_NULL, null=True, blank=True, related_name='invoices')
    
    file_path = models.CharField(max_length=500, blank=True, default='')
    file_name = models.CharField(max_length=255)
    file_format = models.CharField(max_length=10)
    file_size_bytes = models.BigIntegerField(default=0)
    page_count = models.IntegerField(default=1)
    
    invoice_date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    currency = models.CharField(max_length=3, default='INR')
    subtotal = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    tax_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    cgst_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    sgst_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    igst_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    
    ocr_confidence = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    ocr_raw_payload = models.JSONField(blank=True, null=True)
    validation_errors = models.JSONField(default=list, blank=True)
    is_duplicate = models.BooleanField(default=False)
    
    matching_type = models.CharField(max_length=32, choices=MatchingType.choices, default=MatchingType.THREE_WAY)
    matching_status = models.CharField(max_length=32, choices=MatchStatus.choices, default=MatchStatus.PENDING)
    status = models.CharField(max_length=32, choices=InvoiceStatus.choices, default=InvoiceStatus.UPLOADED)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'invoices'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.invoice_number or 'UNPROCESSED'} ({self.status})"

class InvoiceLineItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='line_items')
    line_number = models.IntegerField()
    item_code = models.CharField(max_length=64, blank=True, null=True)
    description = models.TextField()
    hsn_sac_code = models.CharField(max_length=16, blank=True, null=True)
    quantity = models.DecimalField(max_digits=12, decimal_places=3)
    unit_price = models.DecimalField(max_digits=15, decimal_places=2)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=18.00)
    tax_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    total_price = models.DecimalField(max_digits=15, decimal_places=2)
    confidence_score = models.DecimalField(max_digits=5, decimal_places=2, default=95.00)

    class Meta:
        db_table = 'invoice_line_items'
        ordering = ['line_number']
