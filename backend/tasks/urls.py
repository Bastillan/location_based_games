from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, ScenarioViewSet, GameViewSet, UserViewSet, AnswerImagesSet

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'answerimages', AnswerImagesSet, basename='answerimages')
router.register(r'scenarios', ScenarioViewSet, basename='scenario')
router.register(r'games', GameViewSet, basename='game')
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('api/', include(router.urls)),
    path('', include(router.urls)),
]
