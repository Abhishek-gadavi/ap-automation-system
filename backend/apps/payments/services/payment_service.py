"""
Payment Processing & Advice Generation Service
Simulates enterprise ERP banking integration (NEFT/RTGS/ACH batch generation)
and creates formal digital Remittance Advice.
"""

import uuid
from datetime import datetime
from django.utils import timezone
from apps.payments.models import PaymentRequest, PaymentStatus
from apps.invoices.models import Invoice, InvoiceStatus
from apps.approvals.models import AuditLog

class PaymentProcessingService:

    @classmethod
    def generate_payment_request(cls, invoice, payment_method='NEFT'):
        if invoice.status != InvoiceStatus.APPROVED:
            raise ValueError("Only fully approved invoices can be scheduled for payment.")

        primary_bank = invoice.vendor.bank_details.filter(is_primary=True).first() if invoice.vendor else None
        ref = f"PAY-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"

        payment_request = PaymentRequest.objects.create(
            payment_reference=ref,
            invoice=invoice,
            vendor=invoice.vendor,
            bank_detail=primary_bank,
            payment_method=payment_method,
            amount=invoice.total_amount,
            scheduled_date=invoice.due_date or timezone.now().date(),
            status=PaymentStatus.PENDING
        )

        invoice.status = InvoiceStatus.PAYMENT_SCHEDULED
        invoice.save()

        AuditLog.objects.create(
            entity_type='PAYMENT',
            entity_id=payment_request.id,
            action='PAYMENT_SCHEDULED',
            performed_by='AP_DISBURSEMENT_MODULE',
            details=f"Generated payment request {ref} for ₹{payment_request.amount:,.2f} via {payment_method}."
        )

        return payment_request

    @classmethod
    def process_bank_settlement(cls, payment_request):
        """
        Simulates payment gateway / banking handshake and issues unique UTR transaction number.
        """
        utr = f"CMS{datetime.now().strftime('%y%m%d%H%M')}{str(uuid.uuid4())[:4].upper()}"
        payment_request.status = PaymentStatus.PAID
        payment_request.utr_number = utr
        payment_request.processed_date = timezone.now()
        payment_request.payment_advice_url = f"/api/v1/payments/{payment_request.id}/advice/"
        payment_request.save()

        invoice = payment_request.invoice
        invoice.status = InvoiceStatus.PAID
        invoice.save()

        AuditLog.objects.create(
            entity_type='PAYMENT',
            entity_id=payment_request.id,
            action='PAYMENT_SETTLED',
            performed_by='BANKING_INTERFACE',
            details=f"Payment settled successfully. UTR: {utr}."
        )

        return payment_request

    @classmethod
    def render_payment_advice_html(cls, payment_request):
        """
        Generates formal remittance advice document.
        """
        inv = payment_request.invoice
        vnd = payment_request.vendor
        bank = payment_request.bank_detail

        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Payment Advice - {payment_request.payment_reference}</title>
            <style>
                body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #1e293b; }}
                .header {{ border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; }}
                .company {{ font-size: 20px; font-weight: bold; color: #1e3a8a; }}
                .title {{ font-size: 24px; font-weight: bold; text-align: right; color: #2563eb; }}
                .grid {{ display: flex; justify-content: space-between; margin-bottom: 30px; }}
                .box {{ width: 48%; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }}
                table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
                th, td {{ border: 1px solid #cbd5e1; padding: 12px; text-align: left; }}
                th {{ background: #f1f5f9; }}
                .total-row {{ font-weight: bold; background: #e0f2fe; }}
                .footer {{ margin-top: 50px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="header">
                <div class="company">Templegate Technologies & Services Pvt. Ltd.<br><span style="font-size: 13px; font-weight: normal; color: #475569;">Electronic City, Bengaluru, Karnataka 560100</span></div>
                <div class="title">PAYMENT REMITTANCE ADVICE<br><span style="font-size: 14px; font-weight: normal; color: #64748b;">Ref: {payment_request.payment_reference}</span></div>
            </div>
            
            <div class="grid">
                <div class="box">
                    <strong>Vendor Beneficiary:</strong><br>
                    {vnd.name if vnd else 'N/A'}<br>
                    GSTIN: {vnd.gstin if vnd else 'N/A'}<br>
                    Email: {vnd.email if vnd else 'N/A'}
                </div>
                <div class="box">
                    <strong>Banking & Remittance Details:</strong><br>
                    Bank: {bank.bank_name if bank else 'Bank of Record'}<br>
                    A/C No: {bank.account_number if bank else 'XXXX-XXXX-XXXX'}<br>
                    IFSC: {bank.ifsc_code if bank else 'N/A'}<br>
                    <strong>UTR Reference:</strong> {payment_request.utr_number or 'PENDING_DISPATCH'}
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Invoice Number</th>
                        <th>Invoice Date</th>
                        <th>Gross Amount</th>
                        <th>Tax Withholding (TDS)</th>
                        <th>Net Settled Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{inv.invoice_number}</td>
                        <td>{inv.invoice_date}</td>
                        <td>INR {payment_request.amount:,.2f}</td>
                        <td>INR 0.00</td>
                        <td><strong>INR {payment_request.amount:,.2f}</strong></td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="4" style="text-align: right;">Total Transferred:</td>
                        <td>INR {payment_request.amount:,.2f}</td>
                    </tr>
                </tbody>
            </table>

            <div class="footer">
                This is a computer generated electronic remittance advice from Templegate Accounts Payable Automation Software. No physical signature required.
            </div>
        </body>
        </html>
        """
