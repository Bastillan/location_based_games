from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, ScenarioViewSet, GameViewSet, UserViewSet, AnswerImagesSet, TeamViewSet, UserProfileViewSet, send_email, TaskCompletionView

router = DefaultRouter()
router.register(r'tasks', TaskViewSet)
router.register(r'answerimages', AnswerImagesSet, basename='answerimages')
router.register(r'scenarios', ScenarioViewSet, basename='scenario')
router.register(r'games', GameViewSet, basename='game')
router.register(r'users', UserViewSet, basename='user')
router.register(r'teams', TeamViewSet, basename='team')
router.register(r'user-profile', UserProfileViewSet, basename='user-profile')
router.register(r'task-completion', TaskCompletionView, basename='task-completion')

urlpatterns = [
    path('api/', include(router.urls)),
    path('', include(router.urls)),
    path('send-email/', send_email, name='send-email'),
]
