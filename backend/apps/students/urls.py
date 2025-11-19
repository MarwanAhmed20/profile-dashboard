from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, get_current_student, DomainViewSet, get_active_courses_for_registration

# Create separate routers
student_router = DefaultRouter()
student_router.register(r'', StudentViewSet, basename='student')

domain_router = DefaultRouter()
domain_router.register(r'', DomainViewSet, basename='domain')

# Specific endpoints BEFORE router
urlpatterns = [
    path('me/', get_current_student, name='student-me'),
    path('courses/active/', get_active_courses_for_registration, name='active-courses'),
    path('domains/', include(domain_router.urls)),
    path('', include(student_router.urls)),
]
