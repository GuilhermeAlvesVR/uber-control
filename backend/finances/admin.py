from django.contrib import admin
from .models import Transaction, Goal, Expense

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['type', 'category', 'amount', 'date']

@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ['type', 'target_amount']

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ['category', 'amount', 'date', 'payment_method']