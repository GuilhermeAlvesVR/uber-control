from django.urls import path
from .views import RegisterView, UserSettingsView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('settings/', UserSettingsView.as_view(), name='user-settings'),
]