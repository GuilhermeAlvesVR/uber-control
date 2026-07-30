from rest_framework import generics, views, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Journey
from .serializers import JourneyStartSerializer, JourneyEndSerializer, JourneySerializer
from finances.models import Transaction

User = get_user_model()

def _get_user(request):
    if request.user.is_authenticated:
        return request.user
    user, _ = User.objects.get_or_create(id=1, defaults={'email': 'default@uber.com', 'name': 'Motorista'})
    return user

class JourneyStartView(generics.CreateAPIView):
    serializer_class = JourneyStartSerializer

    def perform_create(self, serializer):
        serializer.save(user=_get_user(self.request))

class JourneyEndView(generics.UpdateAPIView):
    serializer_class = JourneyEndSerializer

    def get_queryset(self):
        return Journey.objects.filter(is_active=True, user=_get_user(self.request))

class JourneyListView(generics.ListAPIView):
    serializer_class = JourneySerializer

    def get_queryset(self):
        return Journey.objects.filter(user=_get_user(self.request))

class ActiveJourneyView(views.APIView):
    def get(self, request):
        journey = Journey.objects.filter(is_active=True, user=_get_user(request)).first()
        if journey:
            return Response(JourneySerializer(journey).data)
        return Response(None)

class PauseJourneyView(views.APIView):
    def post(self, request, pk):
        journey = Journey.objects.filter(pk=pk, is_active=True, user=_get_user(request)).first()
        if not journey:
            return Response({'error': 'Jornada nao encontrada'}, status=404)
        journey.is_paused = True
        journey.save()
        return Response(JourneySerializer(journey).data)

class ResumeJourneyView(views.APIView):
    def post(self, request, pk):
        journey = Journey.objects.filter(pk=pk, is_active=True, is_paused=True, user=_get_user(request)).first()
        if not journey:
            return Response({'error': 'Jornada nao encontrada'}, status=404)
        journey.is_paused = False
        journey.save()
        return Response(JourneySerializer(journey).data)

class CancelJourneyView(views.APIView):
    def delete(self, request, pk):
        journey = Journey.objects.filter(pk=pk, user=_get_user(request)).first()
        if not journey:
            return Response({'error': 'Jornada nao encontrada'}, status=404)
        date_str = journey.date.isoformat()
        desc = f'Jornada {date_str}'
        Transaction.objects.filter(
            user=journey.user,
            description__startswith=desc,
            type='income',
        ).delete()
        journey.delete()
        return Response({'message': 'Jornada removida'})

class DailySummaryView(views.APIView):
    def get(self, request):
        from datetime import date
        today = date.today()
        journey = Journey.objects.filter(date=today, is_active=False, user=_get_user(request)).last()
        if journey:
            return Response(JourneySerializer(journey).data)
        return Response(None)