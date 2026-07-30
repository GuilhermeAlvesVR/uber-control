from rest_framework import generics
from django.contrib.auth import get_user_model
from .models import Maintenance
from .serializers import MaintenanceSerializer

User = get_user_model()

def _get_user(request):
    if request.user.is_authenticated:
        return request.user
    user, _ = User.objects.get_or_create(id=1, defaults={'email': 'default@uber.com', 'name': 'Motorista'})
    return user

class MaintenanceListCreateView(generics.ListCreateAPIView):
    serializer_class = MaintenanceSerializer

    def get_queryset(self):
        return Maintenance.objects.filter(user=_get_user(self.request))

    def perform_create(self, serializer):
        serializer.save(user=_get_user(self.request))

class MaintenanceDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = MaintenanceSerializer

    def get_queryset(self):
        return Maintenance.objects.filter(user=_get_user(self.request))