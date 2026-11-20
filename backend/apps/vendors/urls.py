from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VendorViewSet, VendorBankDetailViewSet

router = DefaultRouter()
router.register(r'', VendorViewSet, basename='vendor')
router.register(r'banks', VendorBankDetailViewSet, basename='vendor-bank')

urlpatterns = [
    path('', include(router.urls)),
]
