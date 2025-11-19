from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from apps.students.views import get_current_student

def api_root(request):
    return JsonResponse({
        'message': 'Capsule Dashboard API',
        'version': '1.0.0',
        'endpoints': {
            'auth': {
                'login': '/api/auth/login/',
                'register': '/api/auth/register/',
                'profile': '/api/auth/profile/',
                'refresh': '/api/auth/token/refresh/',
            },
            'students': {
                'list': '/api/students/',
                'me': '/api/students/me/',
                'detail': '/api/students/{id}/',
            },
            'domains': {
                'list': '/api/students/domains/',
            },
            'assessments': {
                'list': '/api/assessments/',
                'detail': '/api/assessments/{id}/',
            },
            'admin': '/admin/',
        },
        'status': 'online'
    })

urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/students/me/', get_current_student, name='student-me'),
    path('api/students/', include('apps.students.urls')),
    path('api/courses/', include('apps.students.courses_urls')),
    path('api/assessments/', include('apps.assessments.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
