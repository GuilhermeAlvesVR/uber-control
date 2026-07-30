from django.urls import path
from .views import TransactionListCreateView, TransactionDetailView, BalanceView, GoalListCreateView, GoalDetailView, ExpenseListCreateView, ExpenseDetailView

urlpatterns = [
    path('transactions/', TransactionListCreateView.as_view(), name='transaction-list'),
    path('transactions/<int:pk>/', TransactionDetailView.as_view(), name='transaction-detail'),
    path('balance/', BalanceView.as_view(), name='balance'),
    path('goals/', GoalListCreateView.as_view(), name='goal-list'),
    path('goals/<int:pk>/', GoalDetailView.as_view(), name='goal-detail'),
    path('expenses/', ExpenseListCreateView.as_view(), name='expense-list'),
    path('expenses/<int:pk>/', ExpenseDetailView.as_view(), name='expense-detail'),
]
