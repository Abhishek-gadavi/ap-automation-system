import uuid
from django.db import models
from apps.invoices.models import Invoice
from apps.vendors.models import Vendor, VendorBankDetail

class PaymentStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending Schedule'
    PROCESSING = 'PROCESSING', 'Processing in Bank'
    PAID = 'PAID', 'Settled / Paid'
    FAILED = 'FAILED', 'Failed'
    CANCELLED = 'CANCELLED', 'Cancelled'

class PaymentRequest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payment_reference = models.CharField(max_length=64, unique=True)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE)
    bank_detail = models.ForeignKey(VendorBankDetail, on_delete=models.SET_NULL, null=True, blank=True)
    payment_method = models.CharField(max_length=32, default='NEFT')
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    scheduled_date = models.DateField()
    processed_date = models.DateTimeField(null=True, blank=True)
    utr_number = models.CharField(max_length=100, null=True, blank=True)
    status = models.CharField(max_length=32, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    batch_reference = models.CharField(max_length=64, null=True, blank=True)
    payment_advice_url = models.CharField(max_length=500, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'payment_requests'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.payment_reference} - {self.vendor.name} (₹{self.amount})"
