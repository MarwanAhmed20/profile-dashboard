from django.contrib import admin
from django.urls import path, include
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def api_root(request):
    return Response({
        'message': 'AI-Capsule API',
        'endpoints': {
            'auth': '/api/auth/',
            'students': '/api/students/',
            'courses': '/api/students/courses/',
            'domains': '/api/students/domains/',
            'announcements': '/api/students/announcements/',
            'assessments': '/api/assessments/',
        }
    })

urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/students/', include('apps.students.urls')),
    path('api/assessments/', include('apps.assessments.urls')),
]
