from django.contrib import admin
from .models import Fueling

@admin.register(Fueling)
class FuelingAdmin(admin.ModelAdmin):
    list_display = ['date', 'station', 'liters', 'amount', 'km']