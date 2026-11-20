import os
from decimal import Decimal
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Invoice, InvoiceLineItem, PurchaseOrder, GoodsReceiptNote, InvoiceStatus, MatchStatus
from .serializers import InvoiceSerializer, InvoiceLineItemSerializer, PurchaseOrderSerializer, GoodsReceiptNoteSerializer
from .services.ocr_engine import OCRExtractionEngine
from .services.validation_engine import InvoiceValidationEngine
from apps.vendors.models import Vendor

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

    @action(detail=False, methods=['post'])
    def capture_invoice(self, request):
        """
        Module 1: Invoice Capture Module
        Accepts PDF, JPG, PNG, TIFF via file upload, drag & drop, or simulated email ingestion.
        """
        uploaded_file = request.FILES.get('file')
        file_name = request.data.get('file_name', uploaded_file.name if uploaded_file else 'uploaded_invoice.pdf')
        source_type = request.data.get('source_type', 'DRAG_AND_DROP')  # UPLOAD, EMAIL, BULK
        
        # Save or simulate file storage
        file_ext = file_name.split('.')[-1].upper() if '.' in file_name else 'PDF'
        file_size = uploaded_file.size if uploaded_file else 1024 * 250
        
        # Initialize invoice record
        invoice = Invoice.objects.create(
            file_name=file_name,
            file_path=f"/uploads/invoices/{file_name}",
            file_format=file_ext,
            file_size_bytes=file_size,
            status=InvoiceStatus.PROCESSING_OCR
        )

        # Module 2: Run OCR & AI Extraction
        extraction = OCRExtractionEngine.process_file(file_name)
        
        invoice.invoice_number = extraction.get('invoice_number')
        invoice.invoice_date = extraction.get('invoice_date')
        invoice.due_date = extraction.get('due_date')
        invoice.subtotal = Decimal(str(extraction.get('subtotal', 0)))
        invoice.tax_amount = Decimal(str(extraction.get('tax_amount', 0)))
        invoice.cgst_amount = Decimal(str(extraction.get('cgst_amount', 0)))
        invoice.sgst_amount = Decimal(str(extraction.get('sgst_amount', 0)))
        invoice.igst_amount = Decimal(str(extraction.get('igst_amount', 0)))
        invoice.total_amount = Decimal(str(extraction.get('total_amount', 0)))
        invoice.ocr_confidence = Decimal(str(extraction.get('ocr_confidence', 95.0)))
        invoice.page_count = extraction.get('page_count', 1)
        invoice.ocr_raw_payload = extraction

        # Link PO if detected in OCR
        po_ref = extraction.get('po_reference')
        if po_ref:
            po = PurchaseOrder.objects.filter(po_number=po_ref).first()
            if po:
                invoice.po = po
                invoice.grn = po.grns.first()

        # Module 3: Run Validation Engine
        is_valid, errors, warnings, vendor = InvoiceValidationEngine.validate(extraction, existing_invoice_id=invoice.id)
        if vendor:
            invoice.vendor = vendor

        invoice.validation_errors = errors
        if is_valid:
            invoice.status = InvoiceStatus.PENDING_MATCHING
        else:
            invoice.status = InvoiceStatus.VALIDATION_FAILED

        invoice.save()

        # Save extracted line items
        for item in extraction.get('line_items', []):
            InvoiceLineItem.objects.create(
                invoice=invoice,
                line_number=item.get('line_number', 1),
                item_code=item.get('item_code'),
                description=item.get('description'),
                hsn_sac_code=item.get('hsn_sac_code'),
                quantity=Decimal(str(item.get('quantity', 1))),
                unit_price=Decimal(str(item.get('unit_price', 0))),
                tax_rate=Decimal(str(item.get('tax_rate', 18))),
                tax_amount=Decimal(str(item.get('tax_amount', 0))),
                total_price=Decimal(str(item.get('total_price', 0))),
                confidence_score=Decimal(str(item.get('confidence_score', 95)))
            )

        return Response(InvoiceSerializer(invoice).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def bulk_upload(self, request):
        """
        Accepts multiple invoice files and processes them concurrently/batch.
        """
        files = request.FILES.getlist('files')
        results = []
        if not files:
            # Demo bulk sample simulation
            sample_names = ['Invoice_Acme_Nov2026.pdf', 'Apex_Freight_Bill_0904.png', 'Vertex_Cloud_Subscription.pdf']
            for s_name in sample_names:
                req_dummy = type('Request', (), {'FILES': {}, 'data': {'file_name': s_name, 'source_type': 'BULK'}})()
                res = self.capture_invoice(req_dummy)
                results.append(res.data)
        else:
            for f in files:
                req_f = type('Request', (), {'FILES': {'file': f}, 'data': {'file_name': f.name, 'source_type': 'BULK'}})()
                res = self.capture_invoice(req_f)
                results.append(res.data)
        return Response({'count': len(results), 'invoices': results})

    @action(detail=True, methods=['post'])
    def revalidate(self, request, pk=None):
        """
        Allows re-triggering validation after manual edits to line items or fields.
        """
        invoice = self.get_object()
        data = {
            'invoice_number': invoice.invoice_number,
            'invoice_date': invoice.invoice_date.isoformat() if invoice.invoice_date else None,
            'total_amount': invoice.total_amount,
            'subtotal': invoice.subtotal,
            'tax_amount': invoice.tax_amount,
            'cgst_amount': invoice.cgst_amount,
            'sgst_amount': invoice.sgst_amount,
            'igst_amount': invoice.igst_amount,
            'vendor_gstin': invoice.vendor.gstin if invoice.vendor else None
        }
        is_valid, errors, warnings, vendor = InvoiceValidationEngine.validate(data, existing_invoice_id=invoice.id)
        invoice.validation_errors = errors
        if is_valid and invoice.status == InvoiceStatus.VALIDATION_FAILED:
            invoice.status = InvoiceStatus.PENDING_MATCHING
        invoice.save()
        return Response({'is_valid': is_valid, 'errors': errors, 'warnings': warnings, 'invoice': InvoiceSerializer(invoice).data})

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer

class GoodsReceiptNoteViewSet(viewsets.ModelViewSet):
    queryset = GoodsReceiptNote.objects.all()
    serializer_class = GoodsReceiptNoteSerializer
