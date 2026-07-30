from django.db import models

class Journey(models.Model):
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField(null=True, blank=True)
    start_km = models.IntegerField()
    end_km = models.IntegerField(null=True, blank=True)
    fuel_level_start = models.CharField(max_length=50, null=True, blank=True)
    uber_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    cash_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    pix_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    card_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    tips = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    tolls_received = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    total_km = models.IntegerField(null=True, blank=True)
    total_revenue = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    revenue_per_km = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    revenue_per_hour = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    total_hours = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_paused = models.BooleanField(default=False)
    paused_seconds = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-start_time']