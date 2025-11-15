from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from .models import Student, Domain, StudentDomainScore
from .serializers import (StudentSerializer, StudentCreateUpdateSerializer, 
                          DomainSerializer, StudentDomainScoreSerializer)


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_current_student(request):
    """Get the current logged-in student's profile"""
    try:
        student = Student.objects.select_related('user').prefetch_related('domain_scores__domain').get(user=request.user)
        serializer = StudentSerializer(student)
        return Response(serializer.data)
    except Student.DoesNotExist:
        return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all().select_related('user').prefetch_related('domain_scores__domain')
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return StudentCreateUpdateSerializer
        return StudentSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        if self.request.user.role == 'admin':
            return self.queryset
        return self.queryset.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'], url_path='domains')
    def domains_list(self, request):
        domains = Domain.objects.all()
        serializer = DomainSerializer(domains, many=True)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """Delete a student and their associated user account"""
        try:
            student = self.get_object()
            user = student.user
            student_name = user.get_full_name()
            
            # Delete the student (cascade will handle domain_scores)
            student.delete()
            
            # Delete the associated user account
            user.delete()
            
            return Response(
                {
                    'success': True,
                    'message': f'Student {student_name} deleted successfully'
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class DomainViewSet(viewsets.ModelViewSet):
    queryset = Domain.objects.all()
    serializer_class = DomainSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]
