from rest_framework import serializers
from .models import Fueling

class FuelingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fueling
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'user']