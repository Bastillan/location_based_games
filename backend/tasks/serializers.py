from rest_framework import serializers
from .models import Task, Scenario, Game


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'

    def validate_number(self, value):
        if value <= 0:
            raise serializers.ValidationError("Number must be a positive integer.")
        return value


class ScenarioSerializer(serializers.ModelSerializer):
    tasks = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Scenario
        fields = ['id', 'title', 'description', 'image', 'tasks']

class GameSerializer(serializers.ModelSerializer):
    scenario = serializers.PrimaryKeyRelatedField(queryset=Scenario.objects.all())
    class Meta:
        model = Game
        fields = ['id', 'title', 'beginning_date', 'end_date', 'scenario']