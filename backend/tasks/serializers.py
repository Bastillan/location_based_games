from rest_framework import serializers
from .models import Task, Scenario, Game, User, AnswerImages, Team
from django.contrib.auth import get_user_model


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'

    def validate_number(self, value):
        if value <= 0:
            raise serializers.ValidationError("Number must be a positive integer.")
        return value

class AnswerImagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnswerImages
        fields = '__all__'

class ScenarioSerializer(serializers.ModelSerializer):
    tasks = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Scenario
        fields = ['id', 'title', 'description', 'image', 'tasks']


class GameSerializer(serializers.ModelSerializer):
    scenario = ScenarioSerializer(read_only=True)
    scenario_id = serializers.PrimaryKeyRelatedField(queryset=Scenario.objects.all(), write_only=True, source='scenario')
    class Meta:
        model = Game
        fields = ['id', 'title', 'beginning_date', 'end_date', 'scenario', 'scenario_id']


class UserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = '__all__'
