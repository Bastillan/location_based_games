from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import Scenario, Task, Game, User, Team, CompletedTask
from django.contrib.auth import get_user_model
from django.utils.timezone import now
from datetime import timedelta

class ScenarioViewSetTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.scenario = Scenario.objects.create(title="Test Scenario", description="Test Description")

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
        self.client = APIClient()
        self.scenario = Scenario.objects.create(title="Test Scenario", description="Test Description")

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
            end_date=now() + timedelta(days=1)
        )
        self.user_model = get_user_model()
        self.user = self.user_model.objects.create_user(username="testuser", password="testpassword")
        self.profile = User.objects.create(user=self.user)
        self.team = Team.objects.create(user=self.profile, game=self.game)

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
