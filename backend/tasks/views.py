from django.shortcuts import render
from rest_framework import viewsets
from .models import Task, Scenario, Game, User, AnswerImages, Team, CompletedTask
from .serializers import (TaskSerializer, ScenarioSerializer, GameSerializer, UserSerializer, AnswerImagesSerializer,
                          TeamSerializer, UserProfileSerializer, EmailSerializer, CompletedTaskSerializer)
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action, api_view, permission_classes
from django.db.models import F
from rest_framework import serializers
from datetime import datetime
from geopy.distance import geodesic
from django.core.mail import send_mail
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rapidfuzz import fuzz
from itertools import permutations
from .permissions import IsStaff


class ScenarioViewSet(viewsets.ModelViewSet):
    """Used for managing scenarios"""
    queryset = Scenario.objects.all()
    serializer_class = ScenarioSerializer
    permission_classes = [IsStaff]

    @action(detail=True, methods=['get'])
    def get_tasks(self, request, pk=None):
        """Returns list of scenario tasks"""
        scenario = self.get_object()
        tasks = scenario.tasks.all()
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        """Create new scenario"""
        scenario = serializer.save()

        tasks = self.request.data.get('tasks', [])
        if tasks:
            for task_data in tasks:
                task_data['scenario'] = scenario.id
                Task.objects.create(**task_data)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def add_task(self, request, pk=None):
        """Add a task to the selected scenario."""
        scenario = self.get_object()
        data = request.data.copy()
        data['scenario'] = scenario.id

        serializer = TaskSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AnswerImagesSet(viewsets.ModelViewSet):
    """User for managing answer images"""
    queryset = AnswerImages.objects.all()
    serializer_class = AnswerImagesSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        """Returns list of task images using for answering""" 
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
    """Used for managing tasks"""
    queryset = Task.objects.all().order_by('number')
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        """Deleting tasks"""
        task = self.get_object()
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def perform_create(self, serializer):
        """Creating new task"""
        scenario_id = self.request.data.get('scenario')
        correct_images = self.request.FILES.getlist('correctImages')
        incorrect_images = self.request.FILES.getlist('incorrectImages')
        if not scenario_id:
            raise serializers.ValidationError(
                {"scenario": "Scenario ID is required."})

        # Automatic setting number of task
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
        """updating task"""
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
        """Change task number"""
        task = self.get_object()
        Task.objects.filter(number__gt=task.number).update(
            number=F('number') + 1)
        task.number = task.number
        task.save()
        return Response({"status": "updated"})

    def get_queryset(self):
        """Returns list of scenario tasks"""
        scenario_id = self.request.query_params.get('scenario', None)
        if scenario_id is not None:
            return Task.objects.filter(scenario_id=scenario_id).order_by('number')
        return Task.objects.all()

    def list(self, request, *args, **kwargs):
        """Returns list of scenario tasks"""
        scenario_id = request.query_params.get('scenario', None)
        if scenario_id:
            self.queryset = self.queryset.filter(scenario_id=scenario_id)
        return super().list(request, *args, **kwargs)

    @action(detail=False, methods=["get"], url_path='check-answer', url_name='check-answer')
    def check_answer(self, request):
        """Checks answer is correct depending on the answer type"""
        answer_type = request.query_params.get("answer_type")
        answer = request.query_params.get("answer")
        task_id = request.query_params.get("task_id")
        result = False
        if answer_type == "text":
            correct_answer = self.queryset.filter(
                id=task_id)[0].correct_text_answer
            if self.compare_text(correct_answer, answer):
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

    def compare_text(self, correct_text: str, text_to_compare: str, min_accuracy: int = 85):
        """Comparing text and returns True or False if text is simmilar, important!: do not replace correct_text with text_to_compare"""
        correct_text = "".join(correct_text.lower().split(" "))
        text_to_compare = text_to_compare.lower().split(" ")
        if len(text_to_compare) > 6:
            return False
        results = []
        for perm_length in range(1, len(text_to_compare)+1):
            perms = permutations(text_to_compare, perm_length)
            for elem in list(perms):
                results.append(fuzz.ratio(correct_text, "".join(elem)))
        return (max(results) >= min_accuracy)


class GameViewSet(viewsets.ModelViewSet):
    """Used for managing scheduled games"""
    queryset = Game.objects.all()
    serializer_class = GameSerializer

    def get_permissions(self):
        """Checks user has privilages to perform action"""
        if self.action == 'create':
            return [IsStaff()]
        elif self.action == 'retrieve':
            return [AllowAny()]
        return super().get_permissions()

    def create(self, request):
        """Create new scheduled game"""
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


class UserViewSet(viewsets.ModelViewSet):
    """Used for managing user data"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


class TeamViewSet(viewsets.ModelViewSet):
    """Used for managing teams"""
    queryset = Team.objects.all()
    serializer_class = TeamSerializer

    def get_permissions(self):
        """Checks user has privilages to perform action"""
        if self.action == 'create':
            return [IsAuthenticated()]
        elif self.action == 'retrieve':
            return [AllowAny()]
        return super().get_permissions()

    def get(self, request):
        """Return data of team"""
        teams = Team.objects.all()
        serializer = TeamSerializer(teams, many=True)
        return Response(serializer.data)

    def create(self, request):
        """Create new team"""
        user = request.user
        user_profile = User.objects.get(user=user)

        game_id = request.data.get("game")
        game = get_object_or_404(Game, id=game_id)

        players_number = request.data.get("players_number", 1)

        existing_team = Team.objects.filter(
            user=user_profile, game=game).first()
        if existing_team:
            serializer = self.get_serializer(existing_team)
            return Response(
                {
                    "team": serializer.data,
                    "error": "You already have a team registered for this game.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        team = Team.objects.create(user=user_profile, game=game, players_number=players_number)
        serializer = self.get_serializer(team)

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UserProfileViewSet(viewsets.ViewSet):
    """Used for managing user data"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request):
        """Create new user"""
        auth_user = request.user

        if User.objects.filter(user=auth_user).exists():
            return Response({'error': 'User profile already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        user_profile = User.objects.create(user=auth_user)

        serializer = UserProfileSerializer(user_profile)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def send_email(request):
    """Send emails to users"""
    if request.method == 'POST':
        serializer = EmailSerializer(data=request.data)
        if serializer.is_valid():
            subject = serializer.validated_data['subject']
            message = serializer.validated_data['message']
            game_id = serializer.validated_data['game_id']
            game = get_object_or_404(Game, id=game_id)
            try:
                teams = game.teams.all()
                recipients = [team.user.user.email for team in teams]

                print(f"Sending email to: {recipients}")
                print(f"Subject: {subject}")
                print(f"Message: {message}")

                send_mail(subject, message,
                          settings.EMAIL_HOST_USER, recipients)
                return Response({"message": "Emails sent successfully!"}, status=status.HTTP_200_OK)
            except Exception as e:
                print(f"Error: {str(e)}")
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskCompletionView(viewsets.ModelViewSet):
    """Used for managing completed tasks"""
    queryset = CompletedTask.objects.all()
    serializer_class = CompletedTaskSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request):
        """Adding completed task to database"""
        team_id = request.data.get("team")
        team = get_object_or_404(Team, id=team_id)

        task_id = request.data.get("task")
        task = get_object_or_404(Task, id=task_id)

        cTask = CompletedTask.objects.create(team=team, task=task)
        serializer = self.get_serializer(cTask)
        print("1")

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def get_queryset(self):
        """Return completed tasks"""
        task_id = self.request.query_params.get('task', None)
        if task_id is not None:
            return CompletedTask.objects.filter(task_id=task_id)
        return CompletedTask.objects.all()

    @action(detail=False, methods=["get"], url_path='current-task', url_name='current-task')
    def current_task(self, request):
        """Return current task to do"""
        team_id = request.query_params.get("team")
        scenario_id = request.query_params.get("scenario")
        scenario_tasks = Task.objects.filter(scenario=scenario_id)
        try:
            completed_tasks = CompletedTask.objects.filter(team=team_id).order_by('-task__number')
            current_task = scenario_tasks.filter(number=completed_tasks[0].task.number+1)
        except:
            current_task = scenario_tasks.filter(number=1)
        ended = False
        percentage = 0

        if len(current_task) == 1:
            serializer = TaskSerializer(current_task, many=True)
            serialized_data = serializer.data[0]
            percentage = (current_task[0].number-1)/len(scenario_tasks)
            serialized_data.pop('correct_text_answer', None)
        else:
            ended = True
            percentage = 1
            serialized_data = {}

        response = {
            "ended": ended,
            "percentage": percentage,
            "current_task": serialized_data,
        }
        
        return(Response(response))
        