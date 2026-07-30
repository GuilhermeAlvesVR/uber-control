from django.urls import path
from .views import FuelingListCreateView, FuelingDetailView

urlpatterns = [
    path('', FuelingListCreateView.as_view(), name='fueling-list'),
    path('<int:pk>/', FuelingDetailView.as_view(), name='fueling-detail'),
]
