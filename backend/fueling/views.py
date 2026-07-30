from rest_framework import generics
from django.contrib.auth import get_user_model
from .models import Fueling
from .serializers import FuelingSerializer

User = get_user_model()

def _get_user(request):
    if request.user.is_authenticated:
        return request.user
    user, _ = User.objects.get_or_create(id=1, defaults={'email': 'default@uber.com', 'name': 'Motorista'})
    return user

class FuelingListCreateView(generics.ListCreateAPIView):
    serializer_class = FuelingSerializer

    def get_queryset(self):
        return Fueling.objects.filter(user=_get_user(self.request))

    def perform_create(self, serializer):
        serializer.save(user=_get_user(self.request))

class FuelingDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = FuelingSerializer

    def get_queryset(self):
        return Fueling.objects.filter(user=_get_user(self.request))