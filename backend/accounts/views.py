from rest_framework import generics, permissions
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, UserSerializer, UserSettingsSerializer
from .models import UserSettings

User = get_user_model()

def _get_user(request):
    if request.user.is_authenticated:
        return request.user
    user, _ = User.objects.get_or_create(id=1, defaults={'email': 'default@uber.com', 'name': 'Motorista'})
    return user

class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

class UserSettingsView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSettingsSerializer

    def get_object(self):
        u = _get_user(self.request)
        obj, _ = UserSettings.objects.get_or_create(user=u)
        return obj