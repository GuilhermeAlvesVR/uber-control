from rest_framework import serializers
from .models import PrivateQuote


class PrivateQuoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrivateQuote
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'user']
