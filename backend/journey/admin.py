from django.contrib import admin
from .models import Journey

@admin.register(Journey)
class JourneyAdmin(admin.ModelAdmin):
    list_display = ['date', 'start_time', 'end_time', 'total_km', 'total_revenue', 'is_active']