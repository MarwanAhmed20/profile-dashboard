from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, get_current_student

# Router for CRUD operations
router = DefaultRouter()
router.register(r'', StudentViewSet, basename='student')

urlpatterns = router.urls
