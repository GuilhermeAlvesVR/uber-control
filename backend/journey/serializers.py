from rest_framework import serializers
from .models import Journey
from datetime import datetime, timedelta

class JourneyStartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Journey
        fields = ['id', 'date', 'start_time', 'start_km', 'fuel_level_start']

class JourneyEndSerializer(serializers.ModelSerializer):
    class Meta:
        model = Journey
        fields = ['end_time', 'end_km', 'uber_amount', 'cash_amount', 'pix_amount', 'card_amount', 'tips', 'tolls_received', 'notes']

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.total_km = instance.end_km - instance.start_km
        instance.total_revenue = sum([instance.uber_amount or 0, instance.cash_amount or 0, instance.pix_amount or 0, instance.card_amount or 0, instance.tips or 0, instance.tolls_received or 0])
        if instance.total_km and instance.total_km > 0:
            instance.revenue_per_km = round(instance.total_revenue / instance.total_km, 2)
        if instance.start_time and instance.end_time:
            start = datetime.combine(instance.date, instance.start_time)
            end = datetime.combine(instance.date, instance.end_time)
            if end <= start:
                end += timedelta(days=1)
            diff = end - start
            total_paused = instance.paused_seconds or 0
            work_seconds = max(diff.total_seconds() - total_paused, 0)
            instance.total_hours = round(work_seconds / 3600, 2)
            if instance.total_hours > 0:
                instance.revenue_per_hour = round(instance.total_revenue / instance.total_hours, 2)
        instance.is_active = False
        instance.is_paused = False
        instance.save()
        return instance

class JourneySerializer(serializers.ModelSerializer):
    class Meta:
        model = Journey
        fields = '__all__'