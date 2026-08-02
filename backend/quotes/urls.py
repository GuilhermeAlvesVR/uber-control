from django.urls import path
from .views import QuoteListCreateView, QuoteRetrieveDestroyView, QuotePDFView

urlpatterns = [
    path('', QuoteListCreateView.as_view(), name='quote-list'),
    path('<int:pk>/', QuoteRetrieveDestroyView.as_view(), name='quote-detail'),
    path('<int:pk>/pdf/', QuotePDFView.as_view(), name='quote-pdf'),
]
