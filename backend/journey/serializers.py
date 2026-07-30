from rest_framework import serializers
from .models import Journey
from finances.models import Transaction
from datetime import datetime, timedelta

class JourneyStartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Journey
        fields = ['id', 'date', 'start_time', 'start_km', 'fuel_level_start']

class JourneyEndSerializer(serializers.ModelSerializer):
    class Meta:
        model = Journey
        fields = ['end_time', 'end_km', 'total_revenue', 'cash_amount', 'cash_on_hand', 'notes']

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.total_km = (instance.end_km or 0) - (instance.start_km or 0)
        if instance.total_km and instance.total_km > 0:
            instance.revenue_per_km = round((instance.total_revenue or 0) / instance.total_km, 2)
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
                instance.revenue_per_hour = round((instance.total_revenue or 0) / instance.total_hours, 2)
        instance.is_active = False
        instance.is_paused = False
        instance.save()

        uber_amount = (instance.total_revenue or 0) - (instance.cash_amount or 0)
        date_str = instance.date.isoformat()
        desc = f'Jornada {date_str}'

        if uber_amount > 0:
            Transaction.objects.create(
                user=instance.user,
                type='income',
                category='uber',
                amount=uber_amount,
                description=f'{desc} - recebido via Uber',
                date=instance.date,
            )
        if instance.cash_amount and instance.cash_amount > 0:
            Transaction.objects.create(
                user=instance.user,
                type='income',
                category='outros',
                amount=instance.cash_amount,
                description=f'{desc} - recebido em dinheiro',
                date=instance.date,
            )

        return instance

class JourneySerializer(serializers.ModelSerializer):
    class Meta:
        model = Journey
        fields = '__all__'