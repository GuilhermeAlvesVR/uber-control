from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from django.contrib.auth import get_user_model
from .models import Transaction, Goal, Expense
from .serializers import TransactionSerializer, GoalSerializer, ExpenseSerializer

User = get_user_model()

def _get_user(request):
    if request.user.is_authenticated:
        return request.user
    user, _ = User.objects.get_or_create(id=1, defaults={'email': 'default@uber.com', 'name': 'Motorista'})
    return user

class TransactionListCreateView(generics.ListCreateAPIView):
    serializer_class = TransactionSerializer

    def get_queryset(self):
        return Transaction.objects.filter(user=_get_user(self.request))

    def perform_create(self, serializer):
        serializer.save(user=_get_user(self.request))

class TransactionDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = TransactionSerializer

    def get_queryset(self):
        return Transaction.objects.filter(user=_get_user(self.request))

class BalanceView(APIView):
    def get(self, request):
        u = _get_user(request)
        incomes = Transaction.objects.filter(user=u, type='income').aggregate(total=Sum('amount'))['total'] or 0
        expenses = Transaction.objects.filter(user=u, type='expense').aggregate(total=Sum('amount'))['total'] or 0
        uber_income = Transaction.objects.filter(user=u, type='income', category='uber').aggregate(total=Sum('amount'))['total'] or 0
        cash_income = Transaction.objects.filter(user=u, type='income', category='outros').aggregate(total=Sum('amount'))['total'] or 0
        sangria = Transaction.objects.filter(user=u, type='expense', category='sangria').aggregate(total=Sum('amount'))['total'] or 0
        return Response({
            'balance': float(incomes - expenses),
            'incomes': float(incomes),
            'expenses': float(expenses),
            'uber_balance': float(uber_income),
            'cash_balance': float(cash_income),
            'sangria': float(sangria),
        })

class GoalListCreateView(generics.ListCreateAPIView):
    serializer_class = GoalSerializer

    def get_queryset(self):
        return Goal.objects.filter(user=_get_user(self.request))

    def perform_create(self, serializer):
        serializer.save(user=_get_user(self.request))

class GoalDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GoalSerializer

    def get_queryset(self):
        return Goal.objects.filter(user=_get_user(self.request))

class ExpenseListCreateView(generics.ListCreateAPIView):
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        return Expense.objects.filter(user=_get_user(self.request))

    def perform_create(self, serializer):
        serializer.save(user=_get_user(self.request))

class ExpenseDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = ExpenseSerializer

    def get_queryset(self):
        return Expense.objects.filter(user=_get_user(self.request))