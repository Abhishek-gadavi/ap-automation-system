"""
Database Seeding Script for AP Automation System
Run with: python seed_data.py
Author: Abhishek Gadavi
"""

import os
import django
from decimal import Decimal
from datetime import datetime, date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ap_core.settings')
django.setup()

from apps.vendors.models import Vendor, VendorBankDetail, VendorStatus
from apps.invoices.models import PurchaseOrder, POLineItem, GoodsReceiptNote, GRNLineItem, Invoice, InvoiceLineItem, InvoiceStatus, MatchStatus, MatchingType
from apps.approvals.models import ApprovalMatrix, InvoiceApproval, ApprovalStatus, AuditLog
from apps.payments.models import PaymentRequest, PaymentStatus

def seed():
    print("Clearing old records...")
    InvoiceApproval.objects.all().delete()
    PaymentRequest.objects.all().delete()
    InvoiceLineItem.objects.all().delete()
    Invoice.objects.all().delete()
    GRNLineItem.objects.all().delete()
    GoodsReceiptNote.objects.all().delete()
    POLineItem.objects.all().delete()
    PurchaseOrder.objects.all().delete()
    VendorBankDetail.objects.all().delete()
    Vendor.objects.all().delete()
    ApprovalMatrix.objects.all().delete()
    AuditLog.objects.all().delete()

    print("Seeding Approval Matrix...")
    ApprovalMatrix.objects.create(tier_level=1, role_name='AP Clerk / Reviewer', min_amount=Decimal('0.00'), max_amount=Decimal('25000.00'), sla_hours=24)
    ApprovalMatrix.objects.create(tier_level=2, role_name='Finance Team Lead', min_amount=Decimal('25000.01'), max_amount=Decimal('100000.00'), sla_hours=24)
    ApprovalMatrix.objects.create(tier_level=3, role_name='Finance Controller', min_amount=Decimal('100000.01'), max_amount=Decimal('500000.00'), sla_hours=48)
    ApprovalMatrix.objects.create(tier_level=4, role_name='Chief Financial Officer (CFO)', min_amount=Decimal('500000.01'), max_amount=Decimal('99999999.99'), requires_parallel_approval=True, sla_hours=72)

    print("Seeding Vendors...")
    v1 = Vendor.objects.create(
        vendor_code='VEND-001',
        name='Acme Industrial Solutions Ltd',
        email='billing@acmeindustrial.com',
        phone='+91 9876543210',
        address_line1='Plot 42, Electronic City Phase 1',
        city='Bengaluru',
        state='Karnataka',
        postal_code='560100',
        country='India',
        gstin='29AABCA1234F1Z5',
        pan_number='AABCA1234F',
        msme_registered=True,
        payment_terms_days=30,
        status=VendorStatus.ACTIVE
    )
    VendorBankDetail.objects.create(
        vendor=v1,
        bank_name='HDFC Bank',
        account_number='50200012345678',
        ifsc_code='HDFC0000123',
        branch_name='Koramangala Bengaluru',
        is_primary=True,
        is_verified=True,
        verified_at=datetime.now()
    )

    v2 = Vendor.objects.create(
        vendor_code='VEND-002',
        name='Apex Logistics & Transport Co',
        email='accounts@apexlogistics.in',
        phone='+91 9876543211',
        address_line1='12 Harbour Road, Ballard Estate',
        city='Mumbai',
        state='Maharashtra',
        postal_code='400001',
        country='India',
        gstin='27BBACB5678G2Z6',
        pan_number='BBACB5678G',
        msme_registered=False,
        payment_terms_days=45,
        status=VendorStatus.ACTIVE
    )
    VendorBankDetail.objects.create(
        vendor=v2,
        bank_name='State Bank of India',
        account_number='309988776655',
        ifsc_code='SBIN0004567',
        branch_name='Fort Mumbai',
        is_primary=True,
        is_verified=True,
        verified_at=datetime.now()
    )

    v3 = Vendor.objects.create(
        vendor_code='VEND-003',
        name='Vertex Cloud Infrastructure',
        email='invoicing@vertexcloud.io',
        phone='+91 9876543212',
        address_line1='DLF Cyber City, Tower B',
        city='Gurugram',
        state='Haryana',
        postal_code='122002',
        country='India',
        gstin='06CCACC9012H3Z7',
        pan_number='CCACC9012H',
        msme_registered=False,
        payment_terms_days=15,
        status=VendorStatus.ACTIVE
    )

    v4 = Vendor.objects.create(
        vendor_code='VEND-004',
        name='Sigma Raw Materials Corp',
        email='sales@sigmamaterials.com',
        phone='+91 9876543213',
        address_line1='GIDC Industrial Estate',
        city='Vadodara',
        state='Gujarat',
        postal_code='390010',
        country='India',
        gstin='24DDADD3456I4Z8',
        pan_number='DDADD3456I',
        msme_registered=True,
        payment_terms_days=30,
        status=VendorStatus.PENDING_ONBOARDING
    )

    print("Seeding Purchase Orders & GRNs...")
    po1 = PurchaseOrder.objects.create(
        po_number='PO-2026-0891',
        vendor=v1,
        po_date=date(2026, 11, 1),
        delivery_date=date(2026, 11, 15),
        currency='INR',
        subtotal=Decimal('150000.00'),
        tax_amount=Decimal('27000.00'),
        total_amount=Decimal('177000.00'),
        status='OPEN'
    )
    pol1 = POLineItem.objects.create(
        po=po1,
        item_code='ITM-SRV-01',
        description='High-Precision CNC Machined Cylinders',
        quantity=Decimal('50.000'),
        unit_of_measure='NOS',
        unit_price=Decimal('2000.00'),
        tax_rate=Decimal('18.00'),
        tax_amount=Decimal('18000.00'),
        total_price=Decimal('118000.00')
    )
    pol2 = POLineItem.objects.create(
        po=po1,
        item_code='ITM-SRV-02',
        description='High-Tensile Industrial Fasteners (Box of 500)',
        quantity=Decimal('25.000'),
        unit_of_measure='BOX',
        unit_price=Decimal('2000.00'),
        tax_rate=Decimal('18.00'),
        tax_amount=Decimal('9000.00'),
        total_price=Decimal('59000.00')
    )

    grn1 = GoodsReceiptNote.objects.create(
        grn_number='GRN-2026-0412',
        po=po1,
        vendor=v1,
        received_date=date(2026, 11, 14),
        received_by='Ramesh Kumar (Warehouse Mgr)',
        warehouse_code='WH-BLR-01',
        notes='All items inspected and verified against PO.'
    )
    GRNLineItem.objects.create(
        grn=grn1,
        po_line_item=pol1,
        item_code='ITM-SRV-01',
        quantity_received=Decimal('50.000'),
        quantity_accepted=Decimal('50.000'),
        quantity_rejected=Decimal('0.000')
    )
    GRNLineItem.objects.create(
        grn=grn1,
        po_line_item=pol2,
        item_code='ITM-SRV-02',
        quantity_received=Decimal('25.000'),
        quantity_accepted=Decimal('25.000'),
        quantity_rejected=Decimal('0.000')
    )

    print("Seeding Invoices & Approvals...")
    inv1 = Invoice.objects.create(
        invoice_number='INV-2026-7892',
        vendor=v1,
        po=po1,
        grn=grn1,
        file_path='/uploads/invoices/INV-2026-7892.pdf',
        file_name='INV-2026-7892.pdf',
        file_format='PDF',
        file_size_bytes=245100,
        page_count=1,
        invoice_date=date(2026, 11, 15),
        due_date=date(2026, 12, 15),
        currency='INR',
        subtotal=Decimal('150000.00'),
        tax_amount=Decimal('27000.00'),
        cgst_amount=Decimal('13500.00'),
        sgst_amount=Decimal('13500.00'),
        igst_amount=Decimal('0.00'),
        total_amount=Decimal('177000.00'),
        ocr_confidence=Decimal('98.50'),
        matching_type=MatchingType.THREE_WAY,
        matching_status=MatchStatus.MATCHED_EXACT,
        status=InvoiceStatus.PENDING_APPROVAL
    )
    InvoiceLineItem.objects.create(
        invoice=inv1,
        line_number=1,
        item_code='ITM-SRV-01',
        description='High-Precision CNC Machined Cylinders',
        hsn_sac_code='8412',
        quantity=Decimal('50.000'),
        unit_price=Decimal('2000.00'),
        tax_rate=Decimal('18.00'),
        tax_amount=Decimal('18000.00'),
        total_price=Decimal('118000.00'),
        confidence_score=Decimal('99.20')
    )
    InvoiceLineItem.objects.create(
        invoice=inv1,
        line_number=2,
        item_code='ITM-SRV-02',
        description='High-Tensile Industrial Fasteners (Box of 500)',
        hsn_sac_code='7318',
        quantity=Decimal('25.000'),
        unit_price=Decimal('2000.00'),
        tax_rate=Decimal('18.00'),
        tax_amount=Decimal('9000.00'),
        total_price=Decimal('59000.00'),
        confidence_score=Decimal('97.80')
    )

    InvoiceApproval.objects.create(
        invoice=inv1,
        tier_level=3,
        approver_role='Finance Controller',
        approver_email='controller@templegate.example.com',
        status=ApprovalStatus.PENDING,
        comments='Awaiting controller sign-off for invoice exceeding ₹1,00,000 threshold.'
    )

    # Seed an approved & paid invoice
    inv2 = Invoice.objects.create(
        invoice_number='INV-APEX-1049',
        vendor=v2,
        file_path='/uploads/invoices/INV-APEX-1049.pdf',
        file_name='INV-APEX-1049.pdf',
        file_format='PDF',
        file_size_bytes=184000,
        page_count=1,
        invoice_date=date(2026, 10, 20),
        due_date=date(2026, 11, 19),
        currency='INR',
        subtotal=Decimal('42500.00'),
        tax_amount=Decimal('7650.00'),
        cgst_amount=Decimal('0.00'),
        sgst_amount=Decimal('0.00'),
        igst_amount=Decimal('7650.00'),
        total_amount=Decimal('50150.00'),
        ocr_confidence=Decimal('99.10'),
        matching_type=MatchingType.TWO_WAY,
        matching_status=MatchStatus.MATCHED_EXACT,
        status=InvoiceStatus.PAID
    )
    pay2 = PaymentRequest.objects.create(
        payment_reference='PAY-20261105-X9810',
        invoice=inv2,
        vendor=v2,
        bank_detail=v2.bank_details.first(),
        payment_method='NEFT',
        amount=inv2.total_amount,
        scheduled_date=date(2026, 11, 5),
        processed_date=datetime.now(),
        utr_number='CMS2611050912X45P',
        status=PaymentStatus.PAID,
        payment_advice_url=f"/api/v1/payments/PAY-20261105-X9810/advice/"
    )

    AuditLog.objects.create(
        entity_type='SYSTEM',
        entity_id=inv1.id,
        action='SYSTEM_BOOTSTRAP',
        performed_by='ADMIN_MIGRATION',
        details='Initial database seed completed successfully.'
    )

    print("Database seeding completed successfully!")

if __name__ == '__main__':
    seed()
