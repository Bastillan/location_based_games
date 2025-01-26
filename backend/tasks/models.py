from django.db import models
from django.conf import settings


class Scenario(models.Model):
    """Scenario model used for storing scenarios"""
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='scenarios/', blank=True, null=True)

    def __str__(self):
        return self.title

class Task(models.Model):
    """Task model used for storing tasks of scenario with descriptions and answers"""
    scenario = models.ForeignKey(Scenario, related_name='tasks', on_delete=models.CASCADE, null=True)
    number = models.PositiveIntegerField()
    description = models.TextField()
    answer_type = models.TextField(default="text")
    correct_text_answer = models.TextField(null=True, default=None)
    image = models.ImageField(upload_to='images/', blank=True, null=True)
    audio = models.FileField(upload_to='audio/', blank=True, null=True)

    def __str__(self):
        return f"Task {self.number}: {self.description[:20]}"

class AnswerImages(models.Model):
    """AnswerImages model used for storing images for task, Task should include minimum 1 correct and 3 incorrect images."""
    task = models.ForeignKey(Task, related_name='AnswerImages', on_delete=models.CASCADE, null=True)
    is_correct = models.BooleanField(default=False)
    image  = models.ImageField(upload_to='images/', blank=True, null=True)

class Game(models.Model):
    """Game model used for storing game with her scenario, title, beginning and end date."""
    scenario = models.ForeignKey(Scenario, related_name="games", on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    beginning_date = models.DateTimeField()
    end_date = models.DateTimeField()

    def __str__(self):
        return f"Game {self.title}: from {self.beginning_date} to {self.end_date}"

class User(models.Model):
    """User model, allows storing users data such as username, passowrd, team"""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

class Team(models.Model):
    """Team model used for representing teams and storing number of team members (including participants without an account)"""
    user = models.ForeignKey(User, related_name="teams", on_delete=models.CASCADE)
    game = models.ForeignKey(Game, related_name="teams", on_delete=models.CASCADE)
    players_number = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"Team of user: {self.user} in game: {self.game.title}"

class CompletedTask(models.Model):
    """CompletedTask model used for representing tasks done by team"""
    team = models.ForeignKey(Team, related_name="completedTasks", on_delete=models.CASCADE)
    task = models.ForeignKey(Task, related_name="completedTasks", on_delete=models.CASCADE)
    game = models.ForeignKey(Game, related_name="completedTasks", on_delete=models.CASCADE)