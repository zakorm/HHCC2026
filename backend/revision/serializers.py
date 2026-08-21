from rest_framework import serializers

from .models import RevisionMaterial


class RevisionMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = RevisionMaterial
        fields = [
            "id", "topic", "tool_type", "weakness_type", "title", "description",
            "content_url", "created_at",
        ]
        read_only_fields = ["id", "created_at"]
