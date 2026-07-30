from django.urls import path
from .views import JourneyStartView, JourneyEndView, JourneyListView, ActiveJourneyView, PauseJourneyView, ResumeJourneyView, CancelJourneyView, DailySummaryView

urlpatterns = [
    path('start/', JourneyStartView.as_view(), name='journey-start'),
    path('<int:pk>/end/', JourneyEndView.as_view(), name='journey-end'),
    path('<int:pk>/pause/', PauseJourneyView.as_view(), name='journey-pause'),
    path('<int:pk>/cancel/', CancelJourneyView.as_view(), name='journey-cancel'),
    path('<int:pk>/resume/', ResumeJourneyView.as_view(), name='journey-resume'),
    path('active/', ActiveJourneyView.as_view(), name='journey-active'),
    path('summary/', DailySummaryView.as_view(), name='journey-summary'),
    path('', JourneyListView.as_view(), name='journey-list'),
]