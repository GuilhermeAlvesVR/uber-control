from django.urls import path
from .views import QuoteListCreateView, QuoteRetrieveDestroyView, QuotePDFView, QuoteCalculateView

urlpatterns = [
    path('', QuoteListCreateView.as_view(), name='quote-list'),
    path('calculate/', QuoteCalculateView.as_view(), name='quote-calculate'),
    path('<int:pk>/', QuoteRetrieveDestroyView.as_view(), name='quote-detail'),
    path('<int:pk>/pdf/', QuotePDFView.as_view(), name='quote-pdf'),
]
