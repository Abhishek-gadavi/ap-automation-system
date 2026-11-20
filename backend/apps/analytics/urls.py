from django.urls import path
from .views import DashboardOverviewView, ReportsView

urlpatterns = [
    path('dashboard/', DashboardOverviewView.as_view(), name='dashboard-overview'),
    path('reports/', ReportsView.as_view(), name='reports'),
]
