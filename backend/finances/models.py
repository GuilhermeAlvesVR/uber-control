from django.db import models
from django.conf import settings

CATEGORY_CHOICES = [
    ('combustivel', 'Combustível'),
    ('alimentacao', 'Alimentação'),
    ('lavagem', 'Lavagem'),
    ('manutencao', 'Manutenção'),
    ('seguro', 'Seguro'),
    ('pedagio', 'Pedágio'),
    ('uber', 'Uber'),
    ('particular', 'Particular'),
    ('outros', 'Outros'),
]

class Transaction(models.Model):
    TYPE_CHOICES = [
        ('income', 'Entrada'),
        ('expense', 'Saída'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='transactions')
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(null=True, blank=True)
    date = models.DateField()
    payment_method = models.CharField(max_length=20, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']

class Goal(models.Model):
    TYPE_CHOICES = [('daily', 'Diária'), ('weekly', 'Semanal'), ('monthly', 'Mensal')]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='goals')
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    target_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'type']

class Expense(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='expenses')
    date = models.DateField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20)
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']
