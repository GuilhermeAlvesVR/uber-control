from django.urls import path
from .views import ReportView, ReportPDFView

urlpatterns = [
    path('', ReportView.as_view(), name='report'),
    path('pdf/', ReportPDFView.as_view(), name='report-pdf'),
]
