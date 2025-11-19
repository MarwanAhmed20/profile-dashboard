from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Student, Domain, StudentDomainScore, DomainStrength, DomainWeakness, Course
from .serializers import (StudentSerializer, StudentCreateUpdateSerializer, 
                          DomainSerializer, StudentDomainScoreSerializer, 
                          DomainStrengthSerializer, DomainWeaknessSerializer, 
                          CourseSerializer)
from rest_framework.permissions import IsAdminUser


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_student(request):
    """Get the current logged-in student's profile"""
    try:
        student = Student.objects.get(user=request.user)
        serializer = StudentSerializer(student)
        return Response(serializer.data)
    except Student.DoesNotExist:
        # Return a helpful error message
        return Response(
            {
                'error': 'No student profile found',
                'message': 'Your account does not have a student profile yet. Please contact an administrator.',
                'user': {
                    'email': request.user.email,
                    'first_name': request.user.first_name,
                    'last_name': request.user.last_name,
                    'role': request.user.role
                }
            },
            status=status.HTTP_404_NOT_FOUND
        )


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

    @action(detail=True, methods=['post'], url_path='domain-scores/(?P<domain_score_id>[^/.]+)/strengths')
    def add_strength(self, request, pk=None, domain_score_id=None):
        """Add a strength to a domain score"""
        try:
            domain_score = StudentDomainScore.objects.get(id=domain_score_id, student_id=pk)
            serializer = DomainStrengthSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(student_domain=domain_score)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except StudentDomainScore.DoesNotExist:
            return Response({'error': 'Domain score not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'], url_path='domain-scores/(?P<domain_score_id>[^/.]+)/weaknesses')
    def add_weakness(self, request, pk=None, domain_score_id=None):
        """Add a weakness to a domain score"""
        try:
            domain_score = StudentDomainScore.objects.get(id=domain_score_id, student_id=pk)
            serializer = DomainWeaknessSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(student_domain=domain_score)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except StudentDomainScore.DoesNotExist:
            return Response({'error': 'Domain score not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'], url_path='strengths-weaknesses')
    def strengths_weaknesses_summary(self, request, pk=None):
        """Get summary of strengths and weaknesses for a student"""
        student = self.get_object()
        
        all_strengths = []
        all_weaknesses = []
        
        for domain_score in student.domain_scores.all().prefetch_related('strengths', 'weaknesses').select_related('domain'):
            for strength in domain_score.strengths.all():
                all_strengths.append({
                    'domain': domain_score.domain.name,
                    'title': strength.title,
                    'description': strength.description,
                })
            
            for weakness in domain_score.weaknesses.all():
                all_weaknesses.append({
                    'domain': domain_score.domain.name,
                    'title': weakness.title,
                    'description': weakness.description,
                    'suggestion': weakness.improvement_suggestion,
                })
        
        return Response({
            'strengths': all_strengths,
            'weaknesses': all_weaknesses,
            'chart_data': [
                {'category': 'Strengths', 'count': len(all_strengths), 'color': '#22c55e'},
                {'category': 'Weaknesses', 'count': len(all_weaknesses), 'color': '#ef4444'}
            ]
        })

    @action(detail=True, methods=['get'], url_path='weekly-progress')
    def weekly_progress(self, request, pk=None):
        """Get weekly progress data for a student with historical tracking"""
        student = self.get_object()
        
        from datetime import datetime, timedelta
        
        weeks = []
        
        # Check if student has a course or program_start_date
        if student.course and student.course.start_date:
            start_date = student.course.start_date
            num_weeks = student.course.duration_weeks
        elif student.program_start_date:
            start_date = student.program_start_date
            current_date = datetime.now().date()
            days_diff = (current_date - start_date).days
            num_weeks = (days_diff // 7) + 1
        else:
            return Response({
                'weeks': [],
                'current_average': 0,
                'program_start_date': None,
                'course_duration': None,
                'has_data': False
            })
        
        current_date = datetime.now().date()
        
        # Get historical weekly progress records
        weekly_records = {wp.week_number: float(wp.average_score) 
                         for wp in student.weekly_progress.all()}
        
        # Get current average score
        domain_scores = student.domain_scores.all()
        current_avg = sum(float(ds.score) for ds in domain_scores) / domain_scores.count() if domain_scores.exists() else 0
        
        # Generate weekly data
        for week_num in range(1, num_weeks + 1):
            week_date = start_date + timedelta(weeks=week_num - 1)
            
            # Only show weeks up to current date
            if week_date <= current_date:
                # Use historical data if available, otherwise use current average
                score = weekly_records.get(week_num, round(current_avg, 1))
                
                weeks.append({
                    'week': f"Week {week_num}",
                    'date': week_date.strftime('%Y-%m-%d'),
                    'score': score,
                    'is_historical': week_num in weekly_records
                })
        
        return Response({
            'weeks': weeks,
            'current_average': round(current_avg, 1),
            'program_start_date': start_date.strftime('%Y-%m-%d'),
            'course_duration': student.course.duration_weeks if student.course else None,
            'has_data': True
        })

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
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        # Allow read for authenticated users, write for admins only
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all().prefetch_related('domains', 'students')
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]


@api_view(['GET'])
@permission_classes([permissions.AllowAny])  # Allow anonymous access
def get_active_courses_for_registration(request):
    """Get active courses for student registration"""
    courses = Course.objects.filter(is_active=True).prefetch_related('domains')
    serializer = CourseSerializer(courses, many=True)
    return Response(serializer.data)
