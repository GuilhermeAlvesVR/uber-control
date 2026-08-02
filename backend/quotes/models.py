from django.db import models
from django.conf import settings


class PrivateQuote(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='quotes')
    client_name = models.CharField(max_length=255)
    origin = models.TextField()
    destination = models.TextField()
    origin_lat = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    origin_lon = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    dest_lat = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    dest_lon = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    distance_km = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    price_cash_pix = models.DecimalField(max_digits=10, decimal_places=2)
    price_card = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.client_name} - {self.origin} -> {self.destination}'
