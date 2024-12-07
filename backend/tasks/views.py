from django.shortcuts import render
from rest_framework import viewsets
from .models import Task, Scenario
from .serializers import TaskSerializer, ScenarioSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from django.db.models import F
from rest_framework import serializers


class ScenarioViewSet(viewsets.ModelViewSet):
    queryset = Scenario.objects.all()
    serializer_class = ScenarioSerializer

    @action(detail=True, methods=['get'])
    def get_tasks(self, request, pk=None):
        scenario = self.get_object()
        tasks = scenario.tasks.all() 
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        # Tworzymy scenariusz i zapisujemy go
        scenario = serializer.save()

        # Jeżeli chcemy przypisać zadania, możemy je dodać tutaj
        tasks = self.request.data.get('tasks', [])
        if tasks:
            for task_data in tasks:
                # Tworzymy zadanie powiązane z tym scenariuszem
                task_data['scenario'] = scenario.id  # Dodajemy scenariusz do zadania
                Task.objects.create(**task_data)

        # Zwracamy odpowiedź
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def add_task(self, request, pk=None):
        """Add a task to the selected scenario."""
        scenario = self.get_object()  # Get the current scenario by ID
        data = request.data.copy()
        data['scenario'] = scenario.id  # Attach scenario ID to the task

        serializer = TaskSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all().order_by('number')
    serializer_class = TaskSerializer

    def destroy(self, request, *args, **kwargs):
        task = self.get_object()
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def perform_create(self, serializer):
        scenario_id = self.request.data.get('scenario')
        if not scenario_id:
            raise serializers.ValidationError({"scenario": "Scenario ID is required."})

        number = self.request.data.get('number')
        if number:
            try:
                number = int(number)
                # Update numbers within the specific scenario
                if Task.objects.filter(number=number, scenario_id=scenario_id).exists():
                    Task.objects.filter(number__gte=number, scenario_id=scenario_id).update(number=F('number') + 1)
            except ValueError:
                raise serializers.ValidationError({"number": "Number must be an integer."})
        else:
            # Default to the next available number within the scenario
            number = Task.objects.filter(scenario_id=scenario_id).count() + 1

        serializer.save(number=number, scenario_id=scenario_id)

    def perform_update(self, serializer):
        instance = self.get_object()
        scenario_id = instance.scenario_id
        new_number = serializer.validated_data.get('number')

        if new_number and instance.number != new_number:
            if new_number > instance.number:
                Task.objects.filter(
                    number__gt=instance.number,
                    number__lte=new_number,
                    scenario_id=scenario_id
                ).update(number=F('number') - 1)
            elif new_number < instance.number:
                Task.objects.filter(
                    number__gte=new_number,
                    number__lt=instance.number,
                    scenario_id=scenario_id
                ).update(number=F('number') + 1)

        serializer.save()

    @action(detail=True, methods=['get'])
    def shift_task_numbers(self, request, pk=None):
        task = self.get_object()
        Task.objects.filter(number__gt=task.number).update(number=F('number') + 1)
        task.number = task.number
        task.save()        
        return Response({"status": "updated"})

    def get_queryset(self):
        scenario_id = self.request.query_params.get('scenario', None)
        if scenario_id is not None:
            return Task.objects.filter(scenario_id=scenario_id).order_by('number')
        return Task.objects.all()

    def list(self, request, *args, **kwargs):
        scenario_id = request.query_params.get('scenario', None)
        if scenario_id:
            self.queryset = self.queryset.filter(scenario_id=scenario_id)
        return super().list(request, *args, **kwargs)