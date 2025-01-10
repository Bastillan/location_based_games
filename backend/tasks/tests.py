from django.test import TestCase
from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from .models import Scenario, Task, Game, User, Team, CompletedTask, AnswerImages
from django.contrib.auth.models import User as DjangoUser
from django.contrib.auth import get_user_model
from django.utils.timezone import now
from datetime import timedelta
from rest_framework.exceptions import ValidationError
from django.urls import reverse
from .serializers import (
    TaskSerializer, AnswerImagesSerializer, ScenarioSerializer,
    GameSerializer, UserSerializer, UserProfileSerializer,
    TeamSerializer, EmailSerializer, CompletedTaskSerializer
)
from django.core.files.uploadedfile import SimpleUploadedFile
import io


class ScenarioViewSetTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.scenario = Scenario.objects.create(title="Test Scenario", description="Test Description")
        self.user_model = get_user_model()
        self.user = self.user_model.objects.create_user(username="testuser", password="password")
        self.client.force_authenticate(user=self.user)

    def test_list_scenarios(self):
        response = self.client.get('/api/scenarios/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_scenario(self):
        data = {
            "title": "New Scenario",
            "description": "New Description"
        }
        response = self.client.post('/api/scenarios/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Scenario.objects.count(), 2)

    def test_get_tasks_in_scenario(self):
        task = Task.objects.create(scenario=self.scenario, number=1, description="Test Task")
        response = self.client.get(f'/api/scenarios/{self.scenario.id}/get_tasks/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_create_scenario_missing_fields(self):
        data = {"description": "Missing title"}
        response = self.client.post('/api/scenarios/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TaskViewSetTestCase(TestCase):
    def setUp(self):
        self.user_model = get_user_model()
        self.user = self.user_model.objects.create_user(username="testuser", password="password")
        self.client = APIClient()
        self.scenario = Scenario.objects.create(title="Test Scenario", description="Test Description")
        self.client.force_authenticate(user=self.user)

    def test_create_task(self):
        data = {
            "scenario": self.scenario.id,
            "number": 1,
            "description": "New Task",
            "answer_type": "text",
            "correct_text_answer": "Correct Answer"
        }
        response = self.client.post('/api/tasks/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Task.objects.count(), 1)

    def test_delete_task(self):
        task = Task.objects.create(scenario=self.scenario, number=1, description="Test Task")
        response = self.client.delete(f'/api/tasks/{task.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Task.objects.count(), 0)

    def test_create_task_with_files(self):
        with open('test_image.jpg', 'wb') as f:
            f.write(b"image data")
        with open('test_audio.mp3', 'wb') as f:
            f.write(b"audio data")
        
        data = {
            "scenario": self.scenario.id,
            "number": 1,
            "description": "Task with files",
            "answer_type": "image",
            "correct_text_answer": "Correct Answer"
        }
        files = {
            'image': open('test_image.jpg', 'rb'),
            'audio': open('test_audio.mp3', 'rb'),
        }
        response = self.client.post('/api/tasks/', data, files=files, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_task_number_validation(self):
        Task.objects.create(scenario=self.scenario, number=1, description="Test Task 1")
        data = {
            "scenario": self.scenario.id,
            "number": 1,
            "description": "New Task with conflicting number"
        }
        response = self.client.post('/api/tasks/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        task = Task.objects.get(number=2)
        self.assertEqual(task.number, 2)


class GameViewSetTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.scenario = Scenario.objects.create(title="Test Scenario", description="Test Description")
        self.user_model = get_user_model()
        self.user = self.user_model.objects.create_user(username="testuser", password="password")
        self.client.force_authenticate(user=self.user)

    def test_create_game(self):
        data = {
            "title": "Test Game",
            "beginning_date": (now() + timedelta(days=1)).strftime("%a %b %d %Y %H:%M:%S GMT%z"),
            "end_date": (now() + timedelta(days=2)).strftime("%a %b %d %Y %H:%M:%S GMT%z"),
            "scenario_id": self.scenario.id
        }
        response = self.client.post('/api/games/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Game.objects.count(), 1)

    def test_create_game_invalid_scenario(self):
        data = {
            "title": "Test Game",
            "beginning_date": (now() + timedelta(days=1)).strftime("%a %b %d %Y %H:%M:%S GMT%z"),
            "end_date": (now() + timedelta(days=2)).strftime("%a %b %d %Y %H:%M:%S GMT%z"),
            "scenario_id": 9999
        }
        response = self.client.post('/api/games/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TeamViewSetTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_model = get_user_model()
        self.user = self.user_model.objects.create_user(username="testuser", password="testpassword")
        self.profile = User.objects.create(user=self.user)
        self.scenario = Scenario.objects.create(title="Test Scenario", description="Test Description")
        self.game = Game.objects.create(
            title="Test Game", 
            scenario=self.scenario, 
            beginning_date=now(), 
            end_date=now() + timedelta(days=1)
        )
        self.client.force_authenticate(user=self.user)

    def test_create_team(self):
        self.client.force_authenticate(user=self.user)
        data = {
            "game": self.game.id
        }
        response = self.client.post('/api/teams/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Team.objects.count(), 1)

    def test_create_team_already_registered(self):
        self.client.force_authenticate(user=self.user)
        data = {"game": self.game.id}
        response1 = self.client.post('/api/teams/', data, format='json')
        self.assertEqual(Team.objects.count(), 1)
        response2 = self.client.post('/api/teams/', data, format='json')
        self.assertEqual(response2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response2.data)

    def test_create_team_invalid_game(self):
        self.client.force_authenticate(user=self.user)
        data = {"game": 9999}
        response = self.client.post('/api/teams/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class TaskCompletionViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.scenario = Scenario.objects.create(title="Test Scenario", description="Test Description")
        self.task = Task.objects.create(scenario=self.scenario, number=1, description="Test Task")
        self.user_model = get_user_model()
        self.user = self.user_model.objects.create_user(username="testuser", password="testpassword")
        self.profile = User.objects.create(user=self.user)
        self.game = Game.objects.create(
            title="Test Game", 
            scenario=self.scenario, 
            beginning_date=now(), 
            end_date=now() + timedelta(days=1)
        )
        self.team = Team.objects.create(user=self.profile, game=self.game)
        self.client.force_authenticate(user=self.user)

    def test_create_completed_task(self):
        data = {
            "team": self.team.id,
            "task": self.task.id
        }
        response = self.client.post('/api/task-completion/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['team'], self.team.id)
        self.assertEqual(response.data['task'], self.task.id)
        self.assertEqual(CompletedTask.objects.count(), 1)

    def test_create_completed_task_invalid_task_id(self):
        data = {
            "team": self.team.id,
            "task": 9999  # Nonexistent task
        }
        response = self.client.post('/api/task-completion/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_completed_task_invalid_team_id(self):
        data = {
            "team": 9999,  # Nonexistent team
            "task": self.task.id
        }
        response = self.client.post('/api/task-completion/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class EmailViewTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.scenario = Scenario.objects.create(title="Test Scenario", description="Test Description")
        self.game = Game.objects.create(
            title="Test Game", 
            scenario=self.scenario, 
            beginning_date=now(), 
            end_date=(now() + timedelta(days=1))
        )
        self.user_model = get_user_model()
        self.user = self.user_model.objects.create_user(username="testuser", password="testpassword")
        self.profile = User.objects.create(user=self.user)
        self.team = Team.objects.create(user=self.profile, game=self.game)
        self.client.force_authenticate(user=self.user)

    def test_send_email(self):
        data = {
            "subject": "Test Subject",
            "message": "Test Message",
            "game_id": self.game.id
        }
        response = self.client.post('/api/send-email/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_send_email_missing_fields(self):
        data = {
            "message": "Test Message",  # Missing subject
            "game_id": self.game.id
        }
        response = self.client.post('/api/send-email/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_send_email_invalid_game_id(self):
        data = {
            "subject": "Test Subject",
            "message": "Test Message",
            "game_id": 9999  # Nonexistent game ID
        }
        response = self.client.post('/api/send-email/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class ScenarioViewSetTests(APITestCase):

    def setUp(self):
        self.user_model = get_user_model()
        self.user = self.user_model.objects.create_user(username="testuser", password="password")
        self.client = APIClient()
        self.scenario = Scenario.objects.create(title="Test Scenario", description="Test Description")
        self.task = Task.objects.create(scenario=self.scenario, number=1, description="Test Task")
        
        self.client.force_authenticate(user=self.user)

    def test_get_tasks_authenticated(self):
        url = reverse('scenario-get-tasks', kwargs={'pk': self.scenario.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_tasks_unauthenticated(self):
        self.client.force_authenticate(user=None)
        url = reverse('scenario-get-tasks', kwargs={'pk': self.scenario.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_add_task_to_scenario_authenticated(self):
        url = reverse('scenario-add-task', kwargs={'pk': self.scenario.id})
        task_data = {
            "name": "New Task",
            "description": "Task description",
            "number": 2
        }
        response = self.client.post(url, task_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_add_task_to_scenario_unauthenticated(self):
        self.client.force_authenticate(user=None)
        url = reverse('scenario-add-task', kwargs={'pk': self.scenario.id})
        task_data = {
            "name": "New Task",
            "description": "Task description",
            "number": 2
        }
        response = self.client.post(url, task_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class TaskViewSetTests(APITestCase):

    def setUp(self):
        self.user_model = get_user_model()
        self.user = self.user_model.objects.create_user(username="testuser", password="password")
        self.scenario = Scenario.objects.create(title="Test Scenario", description="Test Description")
        self.task = Task.objects.create(scenario=self.scenario, number=1, description="Test Task")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_create_task_authenticated(self):
        url = reverse('task-list')
        task_data = {
            "name": "Another Task",
            "scenario": self.scenario.id,
            "description": "Task description",
            "number": 2
        }
        response = self.client.post(url, task_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_task_unauthenticated(self):
        self.client.force_authenticate(user=None)
        url = reverse('task-list')
        task_data = {
            "name": "Another Task",
            "scenario": self.scenario.id,
            "description": "Task description",
            "number": 2
        }
        response = self.client.post(url, task_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_task_authenticated(self):
        url = reverse('task-detail', kwargs={'pk': self.task.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_delete_task_unauthenticated(self):
        self.client.force_authenticate(user=None)
        url = reverse('task-detail', kwargs={'pk': self.task.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_check_answer_correct_text(self):
        task = Task.objects.create(scenario=self.scenario, number=2, description="Another Test Task", correct_text_answer="Test Answer")
        url = reverse('task-check-answer')
        response = self.client.get(url, {'answer_type': 'text', 'answer': 'Test Answer', 'task_id': task.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['is_correct'], True)

    def test_check_answer_incorrect_text(self):
        task = Task.objects.create(scenario=self.scenario, number=2, description="Another Test Task", correct_text_answer="Test Answer")
        url = reverse('task-check-answer')
        response = self.client.get(url, {'answer_type': 'text', 'answer': 'Incorrect Answer', 'task_id': task.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['is_correct'], False)

    def test_check_answer_correct_image(self):
        correct_image = AnswerImages.objects.create(task=self.task, is_correct=True, image="correct_image.jpg")
        url = reverse('task-check-answer')
        response = self.client.get(url, {'answer_type': 'image', 'answer': correct_image.id, 'task_id': self.task.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['is_correct'], True)

    def test_check_answer_incorrect_image(self):
        incorrect_image = AnswerImages.objects.create(task=self.task, is_correct=False, image="incorrect_image.jpg")
        url = reverse('task-check-answer')
        response = self.client.get(url, {'answer_type': 'image', 'answer': incorrect_image.id, 'task_id': self.task.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['is_correct'], False)

    def test_check_answer_correct_location(self):
        task = Task.objects.create(scenario=self.scenario, number=2, description="Location Task", correct_text_answer="50.0755,14.4378")
        url = reverse('task-check-answer')
        response = self.client.get(url, {'answer_type': 'location', 'answer': '50.0755,14.4378', 'task_id': task.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['is_correct'], True)

    def test_check_answer_incorrect_location(self):
        task = Task.objects.create(scenario=self.scenario, number=2, description="Location Task", correct_text_answer="50.0755,14.4378")
        url = reverse('task-check-answer')
        response = self.client.get(url, {'answer_type': 'location', 'answer': '50.0755,14.4000', 'task_id': task.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['is_correct'], False)

    def test_get_queryset_with_scenario_id(self):
        task1 = Task.objects.create(scenario=self.scenario, number=2, description="Test Task 1")
        task2 = Task.objects.create(scenario=self.scenario, number=3, description="Test Task 2")
        url = reverse('task-list')
        response = self.client.get(url, {'scenario': self.scenario.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3) #<- trzeci jest robiony w setUp

    def test_get_queryset_without_scenario_id(self):
        task1 = Task.objects.create(scenario=self.scenario, number=2, description="Test Task 1")
        task2 = Task.objects.create(scenario=self.scenario, number=3, description="Test Task 2")
        url = reverse('task-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3) #<- trzeci jest robiony w setUp

    def test_shift_task_numbers(self):
        task1 = Task.objects.create(scenario=self.scenario, number=2, description="Test Task 1")
        task2 = Task.objects.create(scenario=self.scenario, number=3, description="Test Task 2")
        url = reverse('task-shift-task-numbers', kwargs={'pk': task1.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        task1.refresh_from_db()
        task2.refresh_from_db()
        self.assertEqual(task1.number, 2)
        self.assertEqual(task2.number, 4)

    def test_perform_create_without_scenario(self):
        url = reverse('task-list')
        response = self.client.post(url, {"number": 2, 'description': 'Test Task without Scenario'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('scenario', response.data)

    def test_perform_create_with_invalid_number(self):
        url = reverse('task-list')
        response = self.client.post(url, {'scenario': self.scenario.id, 'number': 'invalid', 'description': 'Invalid number task'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('number', response.data)

    def test_perform_update_with_number_shift(self):
        task = Task.objects.create(scenario=self.scenario, number=2, description="Test Task 1")
        url = reverse('task-detail', kwargs={'pk': task.id})
        response = self.client.patch(url, {'number': 2})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        task.refresh_from_db()
        self.assertEqual(task.number, 2)

    def test_len_method(self):
        task1 = Task.objects.create(scenario=self.scenario, number=2, description="Test Task 1")
        task2 = Task.objects.create(scenario=self.scenario, number=3, description="Test Task 2")
        self.assertEqual(len(Task.objects.all()), 3) #<- trzeci jest robiony w setUp


class TaskViewSetTests2(APITestCase):

    def setUp(self):
        self.scenario = Scenario.objects.create(title="Test Scenario", description="Test Description")
        self.task1 = Task.objects.create(scenario=self.scenario, number=1, description="Task 1")
        self.task2 = Task.objects.create(scenario=self.scenario, number=2, description="Task 2")
        self.task3 = Task.objects.create(scenario=self.scenario, number=3, description="Task 3")
        self.user_model = get_user_model()
        self.user = self.user_model.objects.create_user(username="testuser", password="password")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_perform_update_new_number_greater(self):
        url = reverse('task-detail', kwargs={'pk': self.task2.id})
        data = {'number': 4}
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.task2.refresh_from_db()
        self.task3.refresh_from_db()
        self.assertEqual(self.task2.number, 4)
        self.assertEqual(self.task3.number, 2)
        self.assertEqual(self.task1.number, 1)

    def test_perform_update_new_number_smaller(self):
        url = reverse('task-detail', kwargs={'pk': self.task2.id})
        data = {'number': 1}
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.task1.refresh_from_db()
        self.task2.refresh_from_db()
        self.task3.refresh_from_db()
        self.assertEqual(self.task2.number, 1)
        self.assertEqual(self.task3.number, 3)
        self.assertEqual(self.task1.number, 2)

    def test_perform_update_number_same(self):
        url = reverse('task-detail', kwargs={'pk': self.task2.id})
        data = {'number': 2}
        response = self.client.patch(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        task2 = Task.objects.get(id=self.task2.id)
        self.assertEqual(task2.number, 2)
        self.assertEqual(self.task1.number, 1)
        self.assertEqual(self.task3.number, 3)

    def test_perform_update_check_order(self):
        url = reverse('task-detail', kwargs={'pk': self.task2.id})
        data = {'number': 1}
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.task1.refresh_from_db()
        self.task2.refresh_from_db()
        self.task3.refresh_from_db()
        self.assertEqual(self.task1.number, 2)
        self.assertEqual(self.task2.number, 1)
        self.assertEqual(self.task3.number, 3)


class GameViewSetTests(APITestCase):

    def setUp(self):
        self.user_model = get_user_model()
        self.user = self.user_model.objects.create_user(username="testuser", password="password")
        self.scenario = Scenario.objects.create(title="Test Scenario", description="Test Description")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_create_game_authenticated(self):
        url = reverse('game-list')
        game_data = {
            "title": "New Game",
            "beginning_date": (now() + timedelta(days=1)).strftime("%a %b %d %Y %H:%M:%S GMT%z"),
            "end_date": (now() + timedelta(days=2)).strftime("%a %b %d %Y %H:%M:%S GMT%z"),
            "scenario_id": self.scenario.id
        }
        response = self.client.post(url, game_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_game_unauthenticated(self):
        self.client.force_authenticate(user=None)
        url = reverse('game-list')
        game_data = {
            "title": "New Game",
            "beginning_date": (now() + timedelta(days=1)).strftime("%a %b %d %Y %H:%M:%S GMT%z"),
            "end_date": (now() + timedelta(days=2)).strftime("%a %b %d %Y %H:%M:%S GMT%z"),
            "scenario_id": self.scenario.id
        }
        response = self.client.post(url, game_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class UserViewSetTests(APITestCase):

    def setUp(self):
        self.user_model = get_user_model()
        self.user = self.user_model.objects.create_user(username="testuser", password="password")
        self.client = APIClient()

    def test_create_user_profile(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('user-profile-list')
        response = self.client.post(url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(response.data['user'], self.user.id)

    def test_create_user_profile_already_exists(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('user-profile-list')
        self.client.post(url, {}, format='json')
        response = self.client.post(url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'User profile already exists.')

    def test_create_user_profile_unauthenticated(self):
        url = reverse('user-profile-list')
        response = self.client.post(url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class TeamViewSetTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.scenario = Scenario.objects.create(title="Test Scenario", description="Test Description")
        self.game = Game.objects.create(
            title="Test Game", 
            scenario=self.scenario, 
            beginning_date=now(), 
            end_date=(now() + timedelta(days=1))
        )
        self.user_model = get_user_model()
        self.user1 = self.user_model.objects.create_user(username="testuser1", password="testpassword")
        self.profile1 = User.objects.create(user=self.user1)
        self.user2 = self.user_model.objects.create_user(username="testuser2", password="testpassword")
        self.profile2 = User.objects.create(user=self.user2)
        self.team1 = Team.objects.create(user=self.profile1, game=self.game)
        self.team2 = Team.objects.create(user=self.profile1, game=self.game)
        
        self.url = reverse('team-list')

    def test_get_teams_authenticated(self):
        self.client.login(username='testuser', password='password')
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]['id'], self.team1.id)
        self.assertEqual(response.data[1]['id'], self.team2.id)

    def test_get_teams_anonymous(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]['id'], self.team1.id)
        self.assertEqual(response.data[1]['id'], self.team2.id)

    def test_get_teams_permissions_authenticated(self):
        response = self.client.get(reverse('team-detail', kwargs={'pk': self.team1.id}))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.team1.id)
        self.assertEqual(response.data['user'], self.profile1.id)

    def test_get_teams_permissions_anonymous(self):
        response = self.client.get(reverse('team-detail', kwargs={'pk': self.team2.id}))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.team2.id)
        self.assertEqual(response.data['user'], self.profile1.id)

class TaskCompletionViewSetTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.scenario = Scenario.objects.create(title="Test Scenario", description="Test Description")
        self.game = Game.objects.create(
            title="Test Game", 
            scenario=self.scenario, 
            beginning_date=now(), 
            end_date=(now() + timedelta(days=1))
        )
        self.user_model = get_user_model()
        self.user = self.user_model.objects.create_user(username="testuser", password="testpassword")
        self.profile = User.objects.create(user=self.user)
        self.team = Team.objects.create(user=self.profile, game=self.game)
        self.task = Task.objects.create(scenario=self.scenario, number=1, description="Test Task")
        self.completed_task = CompletedTask.objects.create(team=self.team, task=self.task)
        self.client.force_authenticate(user=self.user)

    def test_get_queryset_no_task_param(self):
        """
        Test, czy `get_queryset` zwróci wszystkie ukończone zadania, jeśli nie podano parametru `task`.
        """
        url = reverse('task-completion-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_get_queryset_with_task_param(self):
        """
        Test, czy `get_queryset` zwróci tylko ukończone zadania dla konkretnego zadania, jeśli podano parametr `task`.
        """
        url = reverse('task-completion-list') + '?task=' + str(self.task.id)
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_get_queryset_with_non_existing_task(self):
        """
        Test, czy `get_queryset` zwróci pustą listę, jeśli podano nieistniejące task_id.
        """
        non_existing_task_id = 9999
        url = reverse('task-completion-list') + f'?task={non_existing_task_id}'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)


class ScenarioModelTest(TestCase):
    def test_scenario_creation(self):
        scenario = Scenario.objects.create(
            title="Test Scenario",
            description="This is a test scenario."
        )
        self.assertEqual(str(scenario), "Test Scenario")
        self.assertEqual(scenario.title, "Test Scenario")
        self.assertEqual(scenario.description, "This is a test scenario.")

class TaskModelTest(TestCase):
    def setUp(self):
        self.scenario = Scenario.objects.create(
            title="Scenario for Task",
            description="Scenario description."
        )

    def test_task_creation(self):
        task = Task.objects.create(
            scenario=self.scenario,
            number=1,
            description="Solve this task.",
            answer_type="text",
            correct_text_answer="42"
        )
        self.assertEqual(str(task), "Task 1: Solve this task.")
        self.assertEqual(task.scenario, self.scenario)
        self.assertEqual(task.number, 1)
        self.assertEqual(task.answer_type, "text")
        self.assertEqual(task.correct_text_answer, "42")

    def test_task_without_scenario(self):
        task = Task.objects.create(
            number=2,
            description="Task without scenario.",
            answer_type="text",
        )
        self.assertIsNone(task.scenario)
        self.assertEqual(task.number, 2)

class AnswerImagesModelTest(TestCase):
    def setUp(self):
        self.scenario = Scenario.objects.create(
            title="Scenario with Images",
            description="Scenario description."
        )
        self.task = Task.objects.create(
            scenario=self.scenario,
            number=1,
            description="Solve this task with images.",
            answer_type="image",
        )
        self.client = APIClient()
        self.user_model = get_user_model()
        self.user = self.user_model.objects.create_user(username="testuser", password="password")
        self.client.force_authenticate(user=self.user)

        self.correct_image_file = SimpleUploadedFile(name="correct_image.jpg", content=io.BytesIO(b"dummy image content").getvalue(), content_type="image/jpeg")

        self.incorrect_image_file1 = SimpleUploadedFile(name="incorrect_image1.jpg",content=io.BytesIO(b"dummy image content").getvalue(), content_type="image/jpeg")

        self.incorrect_image_file2 = SimpleUploadedFile(name="incorrect_image2.jpg", content=io.BytesIO(b"dummy image content").getvalue(), content_type="image/jpeg")

        self.correct_image = AnswerImages.objects.create( task=self.task, image=self.correct_image_file,is_correct=True)
        self.incorrect_image1 = AnswerImages.objects.create(task=self.task, image=self.incorrect_image_file1, is_correct=False)
        self.incorrect_image2 = AnswerImages.objects.create(task=self.task, image=self.incorrect_image_file2, is_correct=False)
        
        self.url = reverse('answerimages-list')

    def test_answer_images_creation(self):
        image = AnswerImages.objects.create(
            task=self.task,
            is_correct=True
        )
        self.assertEqual(image.task, self.task)
        self.assertTrue(image.is_correct)

    def test_list_answer_images_authenticated(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

    def test_list_answer_images_filtered_by_task_id(self):
        response = self.client.get(self.url, {'task_id': self.task.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

    def test_list_answer_images_with_correct_and_incorrect_images(self):
        response = self.client.get(self.url, {'task_id': self.task.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        correct_images = [image for image in response.data if image['is_correct']]
        incorrect_images = [image for image in response.data if not image['is_correct']]

        self.assertEqual(len(correct_images), 1)
        self.assertEqual(len(incorrect_images), 2)

    def test_list_answer_images_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_answer_images_no_task_id(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

    def test_list_answer_images_empty_result(self):
        response = self.client.get(self.url, {'task_id': 9999})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_list_answer_images_random_order(self):
        response = self.client.get(self.url, {'task_id': self.task.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        images = response.data
        self.assertNotEqual(images[0]['image'], images[1]['image'])

class GameModelTest(TestCase):
    def setUp(self):
        self.scenario = Scenario.objects.create(
            title="Scenario for Game",
            description="Scenario description."
        )

    def test_game_creation(self):
        beginning_date = now()
        end_date = beginning_date + timedelta(days=1)
        game = Game.objects.create(
            scenario=self.scenario,
            title="Test Game",
            beginning_date=beginning_date,
            end_date=end_date
        )
        self.assertEqual(str(game), f"Game Test Game: from {beginning_date} to {end_date}")
        self.assertEqual(game.scenario, self.scenario)

class UserModelTest(TestCase):
    def setUp(self):
        self.django_user = DjangoUser.objects.create_user(username="testuser", password="testpassword")

    def test_user_creation(self):
        user = User.objects.create(user=self.django_user)
        self.assertEqual(user.user, self.django_user)

class TeamModelTest(TestCase):
    def setUp(self):
        self.django_user = DjangoUser.objects.create_user(username="testuser", password="testpassword")
        self.user = User.objects.create(user=self.django_user)
        self.scenario = Scenario.objects.create(
            title="Scenario for Team",
            description="Scenario description."
        )
        self.beginning_date = now()
        self.end_date = self.beginning_date + timedelta(days=1)
        self.game = Game.objects.create(
            scenario=self.scenario,
            title="Test Game",
            beginning_date=self.beginning_date,
            end_date=self.end_date
        )

    def test_team_creation(self):
        team = Team.objects.create(user=self.user, game=self.game)
        self.assertEqual(str(team), f"Team of user: {self.user} in game: {self.game.title}")
        self.assertEqual(team.user, self.user)
        self.assertEqual(team.game, self.game)

class CompletedTaskModelTest(TestCase):
    def setUp(self):
        self.django_user = DjangoUser.objects.create_user(username="testuser", password="testpassword")
        self.user = User.objects.create(user=self.django_user)
        self.scenario = Scenario.objects.create(
            title="Scenario for Completed Task",
            description="Scenario description."
        )
        self.beginning_date = now()
        self.end_date = self.beginning_date + timedelta(days=1)
        self.game = Game.objects.create(
            scenario=self.scenario,
            title="Test Game",
            beginning_date=self.beginning_date,
            end_date=self.end_date
        )
        self.team = Team.objects.create(user=self.user, game=self.game)
        self.task = Task.objects.create(
            scenario=self.scenario,
            number=1,
            description="Complete this task.",
        )

    def test_completed_task_creation(self):
        completed_task = CompletedTask.objects.create(team=self.team, task=self.task)
        self.assertEqual(completed_task.team, self.team)
        self.assertEqual(completed_task.task, self.task)



class TaskSerializerTest(APITestCase):
    def setUp(self):
        self.scenario = Scenario.objects.create(
            title="Test Scenario",
            description="A scenario description."
        )
        self.task_data = {
            "scenario": self.scenario.id,
            "number": 1,
            "description": "A task description.",
            "answer_type": "text",
            "correct_text_answer": "Correct answer"
        }

        self.task_data_wrong = {
            "scenario": self.scenario.id,
            "number": -1,
            "description": "A task description.",
            "answer_type": "text",
            "correct_text_answer": "Wrong answer"
        }

    def test_task_serializer_valid(self):
        serializer = TaskSerializer(data=self.task_data)
        self.assertTrue(serializer.is_valid())
        task = serializer.save()
        self.assertEqual(task.number, self.task_data['number'])

    def test_task_serializer_invalid_number(self):
        serializer = TaskSerializer(data=self.task_data_wrong)
        self.assertFalse(serializer.is_valid())
        self.assertIn('number', serializer.errors)
        self.assertEqual(
            serializer.errors['number'][0],
            "Ensure this value is greater than or equal to 0."
        )


class AnswerImagesSerializerTest(APITestCase):
    def setUp(self):
        self.task = Task.objects.create(
            number=1,
            description="Task with image",
            answer_type="image"
        )
        self.image_data = {
            "task": self.task.id,
            "is_correct": True
        }

    def test_answer_images_serializer_valid(self):
        serializer = AnswerImagesSerializer(data=self.image_data)
        self.assertTrue(serializer.is_valid())
        answer_image = serializer.save()
        self.assertEqual(answer_image.task, self.task)
        self.assertTrue(answer_image.is_correct)


class ScenarioSerializerTest(APITestCase):
    def setUp(self):
        self.scenario = Scenario.objects.create(
            title="Test Scenario",
            description="A scenario description."
        )
        self.task = Task.objects.create(
            scenario=self.scenario,
            number=1,
            description="A task description.",
            answer_type="text"
        )

    def test_scenario_serializer(self):
        serializer = ScenarioSerializer(self.scenario)
        self.assertEqual(serializer.data['title'], self.scenario.title)
        self.assertIn(self.task.id, serializer.data['tasks'])


class GameSerializerTest(APITestCase):
    def setUp(self):
        self.scenario = Scenario.objects.create(
            title="Test Scenario",
            description="A scenario description."
        )
        self.game_data = {
            "title": "Test Game",
            "beginning_date": now(),
            "end_date": now() + timedelta(days=1),
            "scenario_id": self.scenario.id
        }

    def test_game_serializer_valid(self):
        serializer = GameSerializer(data=self.game_data)
        self.assertTrue(serializer.is_valid())
        game = serializer.save()
        self.assertEqual(game.title, self.game_data['title'])
        self.assertEqual(game.scenario, self.scenario)


class UserSerializerTest(APITestCase):
    def setUp(self):
        self.django_user = DjangoUser.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="testpassword"
        )

    def test_user_serializer(self):
        serializer = UserSerializer(self.django_user)
        self.assertEqual(serializer.data['username'], self.django_user.username)
        self.assertEqual(serializer.data['email'], self.django_user.email)


class UserProfileSerializerTest(APITestCase):
    def setUp(self):
        self.django_user = DjangoUser.objects.create_user(
            username="testuser",
            password="testpassword"
        )
        self.user = User.objects.create(user=self.django_user)

    def test_user_profile_serializer(self):
        serializer = UserProfileSerializer(self.user)
        self.assertEqual(serializer.data['user'], self.django_user.id)


class TeamSerializerTest(APITestCase):
    def setUp(self):
        self.django_user = DjangoUser.objects.create_user(
            username="testuser",
            password="testpassword"
        )
        self.user = User.objects.create(user=self.django_user)
        self.scenario = Scenario.objects.create(
            title="Scenario for Team",
            description="Scenario description."
        )
        self.game = Game.objects.create(
            scenario=self.scenario,
            title="Test Game",
            beginning_date=now(),
            end_date=now() + timedelta(days=1)
        )
        self.team_data = {
            "user": self.user.id,
            "game": self.game.id
        }

    def test_team_serializer_valid(self):
        serializer = TeamSerializer(data=self.team_data)
        self.assertTrue(serializer.is_valid())
        team = serializer.save()
        self.assertEqual(team.user, self.user)
        self.assertEqual(team.game, self.game)


class EmailSerializerTest(APITestCase):
    def setUp(self):
        self.email_data = {
            "subject": "Test Email",
            "message": "This is a test email message.",
            "game_id": 1
        }

    def test_email_serializer_valid(self):
        serializer = EmailSerializer(data=self.email_data)
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.data['subject'], self.email_data['subject'])


class CompletedTaskSerializerTest(APITestCase):
    def setUp(self):
        self.django_user = DjangoUser.objects.create_user(
            username="testuser",
            password="testpassword"
        )
        self.user = User.objects.create(user=self.django_user)
        self.scenario = Scenario.objects.create(
            title="Scenario for Completed Task",
            description="Scenario description."
        )
        self.game = Game.objects.create(
            scenario=self.scenario,
            title="Test Game",
            beginning_date=now(),
            end_date=now() + timedelta(days=1)
        )
        self.team = Team.objects.create(user=self.user, game=self.game)
        self.task = Task.objects.create(
            scenario=self.scenario,
            number=1,
            description="Complete this task.",
        )
        self.completed_task_data = {
            "team": self.team.id,
            "task": self.task.id
        }

    def test_completed_task_serializer_valid(self):
        serializer = CompletedTaskSerializer(data=self.completed_task_data)
        self.assertTrue(serializer.is_valid())
        completed_task = serializer.save()
        self.assertEqual(completed_task.team, self.team)
        self.assertEqual(completed_task.task, self.task)