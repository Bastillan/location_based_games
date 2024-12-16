from django.db import models
from django.conf import settings


class Scenario(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='scenarios/', blank=True, null=True)

    def __str__(self):
        return self.title


class Task(models.Model):
    scenario = models.ForeignKey(Scenario, related_name='tasks', on_delete=models.CASCADE, null=True)
    number = models.PositiveIntegerField()
    description = models.TextField()
    answer_type = models.TextField(default="text")
    correct_answer = models.TextField(null=True, default=None)
    image = models.ImageField(upload_to='images/', blank=True, null=True)
    audio = models.FileField(upload_to='audio/', blank=True, null=True)

    def __str__(self):
        return f"Task {self.number}: {self.description[:20]}"

class Game(models.Model):
    scenario = models.ForeignKey(Scenario, related_name="games", on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    beginning_date = models.DateTimeField()
    end_date = models.DateTimeField()

    def __str__(self):
        return f"Game {self.title}: from {self.beginning_date} to {self.end_date}"

class User(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)