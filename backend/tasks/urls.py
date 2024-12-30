from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, ScenarioViewSet, GameViewSet, UserViewSet, AnswerImagesSet, TeamViewSet

router = DefaultRouter()
router.register(r'tasks', TaskViewSet)
router.register(r'answerimages', AnswerImagesSet, basename='answerimages')
router.register(r'scenarios', ScenarioViewSet, basename='scenario')
router.register(r'games', GameViewSet, basename='game')
router.register(r'users', UserViewSet, basename='user')
router.register(r'teams', TeamViewSet, basename='team')

urlpatterns = [
    path('api/', include(router.urls)),
    path('', include(router.urls)),
]
