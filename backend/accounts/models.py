from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return self.name

class UserSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='settings')
    gas_price = models.DecimalField(max_digits=6, default=5.89, decimal_places=2)
    daily_goal = models.DecimalField(max_digits=10, default=200, decimal_places=2)
    monthly_goal = models.DecimalField(max_digits=10, default=6000, decimal_places=2)
    phone = models.CharField(max_length=20, null=True, blank=True)
    driver_name = models.CharField(max_length=120, null=True, blank=True, help_text="Nome exibido no PDF de orcamentos")
    quote_art = models.TextField(blank=True, null=True, help_text="Base64 data URL da arte de fundo do PDF de orcamentos (A4 ou PNG/JPG)")

    def __str__(self):
        return f'Configs de {self.user.name}'