from django.urls import path
from .views import VehicleRetrieveUpdateView

urlpatterns = [
    path('', VehicleRetrieveUpdateView.as_view(), name='vehicle'),
]
