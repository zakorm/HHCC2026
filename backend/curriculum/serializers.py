from rest_framework import serializers

from .models import Subject, Topic, Unit


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ["id", "name"]
        read_only_fields = ["id"]


class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = ["id", "subject", "name"]
        read_only_fields = ["id"]


class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ["id", "unit", "subject", "name"]
        read_only_fields = ["id"]
