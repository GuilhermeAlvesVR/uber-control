from django.db import models
from django.conf import settings

class Fueling(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='fuelings')
    date = models.DateField()
    station = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    liters = models.DecimalField(max_digits=10, decimal_places=2)
    price_per_liter = models.DecimalField(max_digits=6, decimal_places=2)
    km = models.IntegerField()
    avg_consumption = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    km_per_liter = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    cost_per_km = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def save(self, *args, **kwargs):
        if self.liters > 0:
            self.km_per_liter = round(self.km / self.liters, 2) if self.km else None
            self.cost_per_km = round(self.amount / self.km, 4) if self.km else None
        super().save(*args, **kwargs)
