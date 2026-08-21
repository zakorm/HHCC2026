import uuid

from django.db import models


class Subject(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)  # "Biology", "Mathematics"

    def __str__(self):
        return self.name


class Unit(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="units")
    name = models.CharField(max_length=150)  # "Cells & Organisms", "Fractions"

    def __str__(self):
        return f"{self.subject.name} / {self.name}"


class Topic(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name="topics")
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="topics")
    name = models.CharField(max_length=150)  # "Cells", "Organisms", "Genetics", ...

    class Meta:
        indexes = [models.Index(fields=["subject"])]

    def __str__(self):
        return self.name
