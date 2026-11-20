from rest_framework import serializers
from .models import MatchingResult

class MatchingResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchingResult
        fields = '__all__'
