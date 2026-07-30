from rest_framework import serializers
from .models import Fueling

class FuelingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fueling
        fields = '__all__'