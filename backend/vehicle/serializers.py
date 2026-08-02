from rest_framework import serializers
from .models import Vehicle

class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = ['id', 'model', 'year', 'plate', 'photo', 'avg_consumption', 'next_oil_change_km', 'next_revision_km']