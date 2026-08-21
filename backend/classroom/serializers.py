from rest_framework import serializers

from .models import SchoolClass


class SchoolClassSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolClass
        fields = ["id", "school", "subject", "name", "year_level", "created_at"]
        read_only_fields = ["id", "created_at"]
