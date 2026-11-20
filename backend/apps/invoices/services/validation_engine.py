"""
Invoice Validation Engine
Performs 5-point rigorous validation against enterprise AP rules:
1. Mandatory Field Validation
2. Duplicate Invoice Detection
3. GST / Tax Format & Arithmetic Verification
4. Amount & Subtotal Mathematical Reconciliation
5. Vendor Master & Bank Details Verification
"""

import re
from decimal import Decimal
from apps.vendors.models import Vendor, VendorStatus

class InvoiceValidationEngine:
    COMPANY_STATE_CODE = '29'  # Karnataka (Templegate Technologies default location)

    @classmethod
    def validate(cls, invoice_data, existing_invoice_id=None):
        """
        Validates extracted invoice data.
        Returns (is_valid: bool, errors: list[dict], warnings: list[dict], matched_vendor: Vendor or None)
        """
        errors = []
        warnings = []
        vendor = None

        # 1. Mandatory Field Validation
        mandatory_fields = [
            ('invoice_number', 'Invoice Number'),
            ('invoice_date', 'Invoice Date'),
            ('total_amount', 'Total Amount'),
            ('vendor_gstin', 'Vendor GSTIN'),
        ]

        for field_key, field_label in mandatory_fields:
            val = invoice_data.get(field_key)
            if not val or (isinstance(val, (int, float, Decimal)) and val <= 0):
                errors.append({
                    "rule": "MANDATORY_FIELD_CHECK",
                    "field": field_key,
                    "message": f"Mandatory field '{field_label}' is missing or invalid."
                })

        # 2. Vendor Master Validation
        gstin = invoice_data.get('vendor_gstin')
        if gstin:
            try:
                vendor = Vendor.objects.get(gstin=gstin)
                if vendor.status != VendorStatus.ACTIVE:
                    warnings.append({
                        "rule": "VENDOR_STATUS_CHECK",
                        "message": f"Vendor '{vendor.name}' is currently in '{vendor.status}' state."
                    })
                # Check bank details
                has_verified_bank = vendor.bank_details.filter(is_verified=True).exists()
                if not has_verified_bank:
                    warnings.append({
                        "rule": "BANK_VERIFICATION_CHECK",
                        "message": f"Vendor '{vendor.name}' does not have verified primary bank details."
                    })
            except Vendor.DoesNotExist:
                errors.append({
                    "rule": "VENDOR_MASTER_CHECK",
                    "field": "vendor_gstin",
                    "message": f"No registered vendor found matching GSTIN '{gstin}'. Vendor onboarding required."
                })

        # 3. Duplicate Invoice Validation
        inv_number = invoice_data.get('invoice_number')
        if inv_number and vendor:
            from apps.invoices.models import Invoice
            dup_query = Invoice.objects.filter(vendor=vendor, invoice_number=inv_number)
            if existing_invoice_id:
                dup_query = dup_query.exclude(id=existing_invoice_id)
            if dup_query.exists():
                errors.append({
                    "rule": "DUPLICATE_INVOICE_CHECK",
                    "field": "invoice_number",
                    "message": f"Duplicate invoice detected! Invoice #{inv_number} already exists for vendor {vendor.name}."
                })

        # 4. GST & Tax Validation
        if gstin:
            gst_regex = r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'
            if not re.match(gst_regex, gstin):
                errors.append({
                    "rule": "GST_FORMAT_CHECK",
                    "field": "vendor_gstin",
                    "message": f"GSTIN '{gstin}' does not follow the statutory 15-character Indian format."
                })
            else:
                vendor_state_code = gstin[:2]
                cgst = Decimal(str(invoice_data.get('cgst_amount', 0) or 0))
                sgst = Decimal(str(invoice_data.get('sgst_amount', 0) or 0))
                igst = Decimal(str(invoice_data.get('igst_amount', 0) or 0))

                # Intra-state vs Inter-state GST rules
                if vendor_state_code == cls.COMPANY_STATE_CODE:
                    if igst > Decimal('0.00'):
                        warnings.append({
                            "rule": "GST_TYPE_RULE",
                            "message": "Intra-state supply detected (Karnataka). IGST should normally be 0 and split into CGST + SGST."
                        })
                else:
                    if (cgst > 0 or sgst > 0) and igst == 0:
                        warnings.append({
                            "rule": "GST_TYPE_RULE",
                            "message": "Inter-state supply detected. Tax should ideally be levied under IGST instead of CGST/SGST."
                        })

        # 5. Amount & Math Validation
        subtotal = Decimal(str(invoice_data.get('subtotal', 0) or 0))
        tax_amount = Decimal(str(invoice_data.get('tax_amount', 0) or 0))
        total_amount = Decimal(str(invoice_data.get('total_amount', 0) or 0))

        calculated_total = subtotal + tax_amount
        # Check within 0.50 tolerance for rounding cents
        if abs(calculated_total - total_amount) > Decimal('0.50'):
            errors.append({
                "rule": "AMOUNT_ARITHMETIC_CHECK",
                "field": "total_amount",
                "message": f"Mathematical mismatch: Subtotal ({subtotal}) + Tax ({tax_amount}) = {calculated_total}, but Total stated is {total_amount}."
            })

        is_valid = len(errors) == 0
        return is_valid, errors, warnings, vendor
