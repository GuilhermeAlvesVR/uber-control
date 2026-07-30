from django.urls import path
from .views import MaintenanceListCreateView, MaintenanceDetailView

urlpatterns = [
    path('', MaintenanceListCreateView.as_view(), name='maintenance-list'),
    path('<int:pk>/', MaintenanceDetailView.as_view(), name='maintenance-detail'),
]
