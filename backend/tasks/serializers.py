from rest_framework import serializers
from .models import Task, Scenario, Game, User, AnswerImages, Team, CompletedTask
from django.contrib.auth import get_user_model
from djoser.serializers import UserCreateSerializer as BaseUserSerializer


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'

    def validate_number(self, value):
        if value <= 0:
            raise serializers.ValidationError("Ensure this value is greater than or equal to 0.")
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
    scenario_id = serializers.PrimaryKeyRelatedField(
        queryset=Scenario.objects.all(), write_only=True, source='scenario')

    class Meta:
        model = Game
        fields = ['id', 'title', 'beginning_date',
                  'end_date', 'scenario', 'scenario_id']


class UserSerializer(BaseUserSerializer):
    class Meta(BaseUserSerializer.Meta):
        fields = ['id', 'username', 'email', 'is_staff']


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'user']


class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = '__all__'


class EmailSerializer(serializers.Serializer):
    subject = serializers.CharField(max_length=100)
    message = serializers.CharField()
    game_id = serializers.IntegerField()


class CompletedTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompletedTask
        fields = '__all__'
