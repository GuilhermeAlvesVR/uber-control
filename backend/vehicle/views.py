from rest_framework import generics
from django.contrib.auth import get_user_model
from .models import Vehicle
from .serializers import VehicleSerializer

User = get_user_model()

def _get_user(request):
    if request.user.is_authenticated:
        return request.user
    user, _ = User.objects.get_or_create(id=1, defaults={'email': 'default@uber.com', 'name': 'Motorista'})
    return user

class VehicleRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = VehicleSerializer

    def get_object(self):
        u = _get_user(self.request)
        obj, _ = Vehicle.objects.get_or_create(
            user=u,
            defaults={'model': '', 'year': 2000, 'plate': '', 'avg_consumption': 0},
        )
        return obj