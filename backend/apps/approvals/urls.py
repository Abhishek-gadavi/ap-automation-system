from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ApprovalMatrixViewSet, InvoiceApprovalViewSet, AuditLogViewSet

router = DefaultRouter()
router.register(r'matrix', ApprovalMatrixViewSet, basename='approval-matrix')
router.register(r'requests', InvoiceApprovalViewSet, basename='approval-request')
router.register(r'audit-logs', AuditLogViewSet, basename='audit-log')

urlpatterns = [
    path('', include(router.urls)),
]
