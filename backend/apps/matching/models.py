import uuid
from django.db import models
from apps.invoices.models import Invoice, PurchaseOrder, GoodsReceiptNote, MatchingType, MatchStatus

class MatchingResult(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.OneToOneField(Invoice, on_delete=models.CASCADE, related_name='matching_result')
    po = models.ForeignKey(PurchaseOrder, on_delete=models.SET_NULL, null=True, blank=True)
    grn = models.ForeignKey(GoodsReceiptNote, on_delete=models.SET_NULL, null=True, blank=True)
    matching_type = models.CharField(max_length=32, choices=MatchingType.choices, default=MatchingType.THREE_WAY)
    overall_status = models.CharField(max_length=32, choices=MatchStatus.choices, default=MatchStatus.PENDING)
    
    price_variance_pct = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    qty_variance_pct = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    total_variance_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    
    discrepancy_details = models.JSONField(default=dict, blank=True)
    overridden_by = models.CharField(max_length=150, null=True, blank=True)
    override_reason = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'matching_results'

    def __str__(self):
        return f"Match for {self.invoice.invoice_number}: {self.overall_status}"
