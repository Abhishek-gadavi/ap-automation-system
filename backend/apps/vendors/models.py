import uuid
import re
from django.db import models
from django.core.exceptions import ValidationError

class VendorStatus(models.TextChoices):
    PENDING_ONBOARDING = 'PENDING_ONBOARDING', 'Pending Onboarding'
    UNDER_REVIEW = 'UNDER_REVIEW', 'Under Review'
    ACTIVE = 'ACTIVE', 'Active'
    SUSPENDED = 'SUSPENDED', 'Suspended'
    REJECTED = 'REJECTED', 'Rejected'

class Vendor(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vendor_code = models.CharField(max_length=32, unique=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(max_length=255)
    phone = models.CharField(max_length=32, blank=True, null=True)
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default='India')
    gstin = models.CharField(max_length=15, unique=True, help_text="15-character Indian Goods and Services Tax Identification Number")
    pan_number = models.CharField(max_length=10, help_text="Permanent Account Number")
    msme_registered = models.BooleanField(default=False)
    payment_terms_days = models.IntegerField(default=30)
    status = models.CharField(max_length=32, choices=VendorStatus.choices, default=VendorStatus.PENDING_ONBOARDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'vendors'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.vendor_code} - {self.name}"

    def clean(self):
        # GSTIN Validation: 2 digits (state code) + 10 chars (PAN) + 1 digit (entity number) + 'Z' + 1 checksum char
        gst_regex = r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'
        if not re.match(gst_regex, self.gstin):
            raise ValidationError({'gstin': f"Invalid GSTIN format: '{self.gstin}'. Must follow standard 15-character GST pattern."})

class VendorBankDetail(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name='bank_details')
    bank_name = models.CharField(max_length=150)
    account_number = models.CharField(max_length=50)
    ifsc_code = models.CharField(max_length=20, help_text="11-character Indian Financial System Code")
    branch_name = models.CharField(max_length=150, blank=True, null=True)
    is_primary = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'vendor_bank_details'

    def __str__(self):
        return f"{self.bank_name} ({self.account_number[-4:]}) - {self.vendor.name}"
