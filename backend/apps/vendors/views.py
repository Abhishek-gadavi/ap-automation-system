from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Vendor, VendorBankDetail, VendorStatus
from .serializers import VendorSerializer, VendorBankDetailSerializer

class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer

    @action(detail=True, methods=['post'])
    def approve_onboarding(self, request, pk=None):
        vendor = self.get_object()
        vendor.status = VendorStatus.ACTIVE
        vendor.save()
        return Response({'status': 'Vendor approved and activated', 'vendor': VendorSerializer(vendor).data})

    @action(detail=True, methods=['post'])
    def verify_bank(self, request, pk=None):
        vendor = self.get_object()
        bank_id = request.data.get('bank_id')
        try:
            bank = vendor.bank_details.get(id=bank_id)
            bank.is_verified = True
            bank.verified_at = timezone.now()
            bank.save()
            return Response({'status': 'Bank details successfully verified', 'bank': VendorBankDetailSerializer(bank).data})
        except VendorBankDetail.DoesNotExist:
            return Response({'error': 'Bank record not found'}, status=status.HTTP_404_NOT_FOUND)

class VendorBankDetailViewSet(viewsets.ModelViewSet):
    queryset = VendorBankDetail.objects.all()
    serializer_class = VendorBankDetailSerializer
