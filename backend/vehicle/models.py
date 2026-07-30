from django.db import models
from django.conf import settings

class Vehicle(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='vehicle')
    model = models.CharField(max_length=100)
    year = models.IntegerField()
    plate = models.CharField(max_length=10)
    avg_consumption = models.DecimalField(max_digits=5, decimal_places=2, help_text="km/l")
    next_oil_change_km = models.IntegerField(null=True, blank=True)
    next_revision_km = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.model} - {self.plate}"
