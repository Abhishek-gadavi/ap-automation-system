from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from .models import PaymentRequest
from .serializers import PaymentRequestSerializer
from .services.payment_service import PaymentProcessingService
from apps.invoices.models import Invoice

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = PaymentRequest.objects.all()
    serializer_class = PaymentRequestSerializer

    @action(detail=False, methods=['post'])
    def create_request(self, request):
        invoice_id = request.data.get('invoice_id')
        method = request.data.get('payment_method', 'NEFT')
        try:
            invoice = Invoice.objects.get(id=invoice_id)
            pay_req = PaymentProcessingService.generate_payment_request(invoice, method)
            return Response(PaymentRequestSerializer(pay_req).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def execute_settlement(self, request, pk=None):
        pay_req = self.get_object()
        updated_req = PaymentProcessingService.process_bank_settlement(pay_req)
        return Response(PaymentRequestSerializer(updated_req).data)

    @action(detail=True, methods=['get'])
    def advice(self, request, pk=None):
        pay_req = self.get_object()
        html_content = PaymentProcessingService.render_payment_advice_html(pay_req)
        return HttpResponse(html_content, content_type='text/html')
