from django.contrib import admin
from .models import PrivateQuote


@admin.register(PrivateQuote)
class PrivateQuoteAdmin(admin.ModelAdmin):
    list_display = ('client_name', 'origin', 'destination', 'distance_km', 'created_at')
    search_fields = ('client_name', 'origin', 'destination')
