from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import MatchingResult
from .serializers import MatchingResultSerializer
from .services.matching_engine import POMatchingEngine
from apps.invoices.models import Invoice, MatchStatus, InvoiceStatus, MatchingType

class MatchingViewSet(viewsets.ModelViewSet):
    queryset = MatchingResult.objects.all()
    serializer_class = MatchingResultSerializer

    @action(detail=False, methods=['post'])
    def run_match(self, request):
        """
        Executes 2-way or 3-way matching on the specified invoice.
        """
        invoice_id = request.data.get('invoice_id')
        matching_type = request.data.get('matching_type', MatchingType.THREE_WAY)

        try:
            invoice = Invoice.objects.get(id=invoice_id)
        except Invoice.DoesNotExist:
            return Response({'error': 'Invoice not found'}, status=status.HTTP_404_NOT_FOUND)

        match_output = POMatchingEngine.execute_match(invoice, matching_type)

        matching_result, _ = MatchingResult.objects.update_or_create(
            invoice=invoice,
            defaults={
                'po': invoice.po,
                'grn': invoice.grn,
                'matching_type': matching_type,
                'overall_status': match_output['overall_status'],
                'price_variance_pct': match_output.get('price_variance_pct', 0.0),
                'total_variance_amount': match_output.get('total_variance_amount', 0.0),
                'discrepancy_details': match_output.get('discrepancies', [])
            }
        )

        return Response(MatchingResultSerializer(matching_result).data)

    @action(detail=True, methods=['post'])
    def manual_override(self, request, pk=None):
        """
        Allows authorized manager to override discrepancy with reason.
        """
        matching_result = self.get_object()
        overridden_by = request.data.get('user', 'AP Manager')
        override_reason = request.data.get('reason', 'Variance within operational tolerance.')

        matching_result.overall_status = MatchStatus.MANUALLY_OVERRIDDEN
        matching_result.overridden_by = overridden_by
        matching_result.override_reason = override_reason
        matching_result.save()

        # Update invoice status to pending approval
        invoice = matching_result.invoice
        invoice.matching_status = MatchStatus.MANUALLY_OVERRIDDEN
        invoice.status = InvoiceStatus.PENDING_APPROVAL
        invoice.save()

        return Response(MatchingResultSerializer(matching_result).data)
