from django.db import models


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
    image = models.ImageField(upload_to='images/', blank=True, null=True)
    audio = models.FileField(upload_to='audio/', blank=True, null=True)

    def __str__(self):
        return f"Task {self.number}: {self.description[:20]}"

class Game(models.Model):
    scenario = models.ForeignKey(Scenario, related_name="games", on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    beggining_date = models.DateTimeField()
    end_date = models.DateTimeField()

    def __str__(self):
        return f"Game {self.title}: from {self.beggining_date} to {self.end_date}"