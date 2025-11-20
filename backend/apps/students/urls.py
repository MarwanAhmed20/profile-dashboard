from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    StudentViewSet, 
    DomainViewSet, 
    CourseViewSet,
    AnnouncementViewSet,
    ProjectViewSet,
    NotificationViewSet,
    get_current_student
)

router = DefaultRouter()
router.register(r'list', StudentViewSet, basename='student')
router.register(r'domains', DomainViewSet, basename='domain')
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'announcements', AnnouncementViewSet, basename='announcement')
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('me/', get_current_student, name='student-me'),
    path('', include(router.urls)),
]
