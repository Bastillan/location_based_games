from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, ScenarioViewSet

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'scenarios', ScenarioViewSet, basename='scenario')

urlpatterns = [
    path('api/', include(router.urls)),
    path('', include(router.urls)),
]
