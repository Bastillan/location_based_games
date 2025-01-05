from django.shortcuts import render
from rest_framework import viewsets
from .models import Task, Scenario, Game, User, AnswerImages, Team
from .serializers import TaskSerializer, ScenarioSerializer, GameSerializer, UserSerializer, AnswerImagesSerializer, TeamSerializer, UserProfileSerializer, EmailSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action, api_view, permission_classes
from django.db.models import F
from rest_framework import serializers
from datetime import datetime
from geopy.distance import geodesic
from django.core.mail import send_mail
from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

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
                # Dodajemy scenariusz do zadania
                task_data['scenario'] = scenario.id
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


class AnswerImagesSet(viewsets.ModelViewSet):
    queryset = AnswerImages.objects.all()
    serializer_class = AnswerImagesSerializer

    def list(self, request, *args, **kwargs):
        task_id = request.query_params.get('task_id', None)
        if task_id:
            self.queryset = self.queryset.filter(task=task_id)
        correct_images = self.queryset.filter(
            is_correct=True).order_by('?')[:1]
        incorrect_images = self.queryset.filter(
            is_correct=False).order_by('?')[:3]
        self.queryset = correct_images | incorrect_images
        self.queryset = self.queryset.order_by('?')
        return super().list(request, *args, **kwargs)


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all().order_by('number')
    serializer_class = TaskSerializer

    def destroy(self, request, *args, **kwargs):
        task = self.get_object()
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def perform_create(self, serializer):
        scenario_id = self.request.data.get('scenario')
        correct_images = self.request.FILES.getlist('correctImages')
        incorrect_images = self.request.FILES.getlist('incorrectImages')
        if not scenario_id:
            raise serializers.ValidationError(
                {"scenario": "Scenario ID is required."})

        number = self.request.data.get('number')
        if number:
            try:
                number = int(number)
                # Update numbers within the specific scenario
                if Task.objects.filter(number=number, scenario_id=scenario_id).exists():
                    Task.objects.filter(number__gte=number, scenario_id=scenario_id).update(
                        number=F('number') + 1)
            except ValueError:
                raise serializers.ValidationError(
                    {"number": "Number must be an integer."})
        else:
            # Default to the next available number within the scenario
            number = Task.objects.filter(scenario_id=scenario_id).count() + 1

        task = serializer.save(number=number, scenario_id=scenario_id)
        for correct_image in correct_images:
            AnswerImages.objects.create(
                task=task, is_correct=True, image=correct_image)
        for incorrect_image in incorrect_images:
            AnswerImages.objects.create(
                task=task, is_correct=False, image=incorrect_image)

    def perform_update(self, serializer):
        instance = self.get_object()
        scenario_id = instance.scenario_id
        new_number = serializer.validated_data.get('number')
        correct_images = self.request.FILES.getlist('correctImages')
        incorrect_images = self.request.FILES.getlist('incorrectImages')
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

        task = serializer.save()
        if len(correct_images) > 0:
            AnswerImages.objects.filter(task=task, is_correct=True).delete()
            for correct_image in correct_images:
                AnswerImages.objects.create(
                    task=task, is_correct=True, image=correct_image)

        if len(incorrect_images) > 0:
            AnswerImages.objects.filter(task=task, is_correct=False).delete()
            for incorrect_image in incorrect_images:
                AnswerImages.objects.create(
                    task=task, is_correct=False, image=incorrect_image)

    @action(detail=True, methods=['get'])
    def shift_task_numbers(self, request, pk=None):
        task = self.get_object()
        Task.objects.filter(number__gt=task.number).update(
            number=F('number') + 1)
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

    @action(detail=False, methods=["get"])
    def check_answer(self, request):
        answer_type = request.query_params.get("answer_type")
        answer = request.query_params.get("answer")
        task_id = request.query_params.get("task_id")
        result = False
        if answer_type == "text":
            correct_answer = self.queryset.filter(
                id=task_id)[0].correct_text_answer
            if answer == correct_answer:
                result = True
        elif answer_type == "image":
            result = AnswerImages.objects.filter(id=answer)[0].is_correct
        elif answer_type == "location":
            correct_location = self.queryset.filter(
                id=task_id)[0].correct_text_answer.split(',')
            answer_location = answer.split(',')
            distance = geodesic(correct_location, answer_location).meters
            if distance < 400:
                result = True
        return Response({"is_correct": result})


class GameViewSet(viewsets.ModelViewSet):
    queryset = Game.objects.all()
    serializer_class = GameSerializer

    def create(self, request):
        title = request.data.get('title')
        beginning_date = request.data.get('beginning_date').split(" (")[0]
        end_date = request.data.get('end_date').split(" (")[0]
        beginning_date = datetime.strptime(
            beginning_date,  "%a %b %d %Y %H:%M:%S GMT%z")
        end_date = datetime.strptime(end_date,  "%a %b %d %Y %H:%M:%S GMT%z")
        beginning_date = beginning_date.isoformat()
        end_date = end_date.isoformat()
        scenario_id = request.data.get('scenario_id')
        data = {
            'title': title,
            'beginning_date': beginning_date,
            'end_date': end_date,
            'scenario_id': scenario_id
        }

        serializer = GameSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # def get(self, request):
    #     games = Game.objects.all()
    #     serializer = GameSerializer(games, many=True)
    #     return Response(serializer.data)
    


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer

    def get(self, request):
        teams = Team.objects.all()
        serializer = TeamSerializer(teams, many=True)
        return Response(serializer.data)

    def create(self, request):
        user = request.user
        user_profile = User.objects.get(user=user)

        game_id = request.data.get("game")
        game = Game.objects.get(id=game_id)

        existing_team = Team.objects.filter(
            user=user_profile, game=game).first()
        if existing_team:
            return Response(
                {"error": "You already have a team registered for this game."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        team = Team.objects.create(user=user_profile, game=game)
        serializer = self.get_serializer(team)

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UserProfileViewSet(viewsets.ViewSet):

    permission_classes = [IsAuthenticated]

    def create(self, request):
        auth_user = request.user

        if User.objects.filter(user=auth_user).exists():
            return Response({'error': 'User profile already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        user_profile = User.objects.create(user=auth_user)

        serializer = UserProfileSerializer(user_profile)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def send_email(request):
    if request.method == 'POST':
        serializer = EmailSerializer(data=request.data)
        if serializer.is_valid():
            subject = serializer.validated_data['subject']
            message = serializer.validated_data['message']
            game_id = serializer.validated_data['game_id']

            try:
                # Get the game and its users
                game = Game.objects.get(id=game_id)
                teams = game.teams.all()
                recipients = [team.user.user.email for team in teams]

                # Log debug information
                print(f"Sending email to: {recipients}")
                print(f"Subject: {subject}")
                print(f"Message: {message}")

                send_mail(subject, message, settings.EMAIL_HOST_USER, recipients)
                return Response({"message": "Emails sent successfully!"}, status=status.HTTP_200_OK)
            except Exception as e:
                print(f"Error: {str(e)}")  # Log the error
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)