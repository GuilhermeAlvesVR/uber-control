from django.db import models
from django.conf import settings

class Maintenance(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='maintenances')
    date = models.DateField()
    service = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    km = models.IntegerField()
    workshop = models.CharField(max_length=100)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']
