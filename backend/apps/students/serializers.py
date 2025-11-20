from rest_framework import serializers
from .models import (
    Student, Domain, StudentDomainScore, DomainStrength, 
    DomainWeakness, Course, Announcement, AnnouncementRead, Project, Notification
)
from apps.users.models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role']
        read_only_fields = ['id', 'email', 'role']


class DomainSerializer(serializers.ModelSerializer):
    class Meta:
        model = Domain
        fields = '__all__'


class DomainStrengthSerializer(serializers.ModelSerializer):
    class Meta:
        model = DomainStrength
        fields = ('id', 'title', 'description', 'created_at')


class DomainWeaknessSerializer(serializers.ModelSerializer):
    class Meta:
        model = DomainWeakness
        fields = ('id', 'title', 'description', 'improvement_suggestion', 'created_at')


class StudentDomainScoreSerializer(serializers.ModelSerializer):
    domain_name = serializers.CharField(source='domain.name', read_only=True)
    strengths = DomainStrengthSerializer(many=True, read_only=True)
    weaknesses = DomainWeaknessSerializer(many=True, read_only=True)
    
    class Meta:
        model = StudentDomainScore
        fields = ('id', 'domain', 'domain_name', 'score', 'strengths', 'weaknesses', 'updated_at')


class CourseSerializer(serializers.ModelSerializer):
    domains = DomainSerializer(many=True, read_only=True)
    domain_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    student_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = '__all__'
    
    def get_student_count(self, obj):
        return obj.students.count()
    
    def create(self, validated_data):
        domain_ids = validated_data.pop('domain_ids', [])
        course = Course.objects.create(**validated_data)
        if domain_ids:
            course.domains.set(domain_ids)
        return course
    
    def update(self, instance, validated_data):
        domain_ids = validated_data.pop('domain_ids', None)
        for key, value in validated_data.items():
            setattr(instance, key, value)
        instance.save()
        if domain_ids is not None:
            instance.domains.set(domain_ids)
        return instance


class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    domain_scores = StudentDomainScoreSerializer(many=True, read_only=True)
    course = CourseSerializer(read_only=True)
    overall_score = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    
    class Meta:
        model = Student
        fields = '__all__'
        read_only_fields = ('overall_score', 'domains_mastered')  # Make these read-only


class StudentCreateUpdateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(write_only=True, required=True)
    first_name = serializers.CharField(write_only=True, required=True)
    last_name = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    domains = serializers.ListField(child=serializers.DictField(), write_only=True, required=False)
    course_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Student
        fields = ('id', 'student_id', 'overall_score', 'username', 'email', 
                  'first_name', 'last_name', 'password', 'domains',
                  'program', 'next_milestone', 'domains_mastered', 'total_domains',
                  'overall_summary', 'trainer_feedback', 'program_start_date', 'course_id')
        read_only_fields = ('student_id', 'overall_score', 'domains_mastered')

    def create(self, validated_data):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        user_data = {
            'username': validated_data.pop('username'),
            'email': validated_data.pop('email'),
            'first_name': validated_data.pop('first_name'),
            'last_name': validated_data.pop('last_name'),
            'role': 'student'
        }
        password = validated_data.pop('password', None)
        if not password:
            password = 'student123'
        
        course_id = validated_data.pop('course_id', None)
        domains_data = validated_data.pop('domains', [])
        
        user = User.objects.create_user(**user_data, password=password)
        
        # Create student without syncing
        student = Student(user=user, **validated_data)
        if course_id:
            student.course_id = course_id
        student.save(skip_sync=True)  # Skip sync during creation
        
        # Create domain scores with strengths and weaknesses
        for domain_data in domains_data:
            # Skip auto-calculation during batch creation
            domain_score = StudentDomainScore(
                student=student,
                domain_id=domain_data['domain_id'],
                score=domain_data['score']
            )
            domain_score.save(skip_calculation=True)
            
            # Add strengths
            for strength_data in domain_data.get('strengths', []):
                if strength_data.get('title'):
                    DomainStrength.objects.create(
                        student_domain=domain_score,
                        title=strength_data['title'],
                        description=strength_data.get('description', '')
                    )
            
            # Add weaknesses
            for weakness_data in domain_data.get('weaknesses', []):
                if weakness_data.get('title'):
                    DomainWeakness.objects.create(
                        student_domain=domain_score,
                        title=weakness_data['title'],
                        description=weakness_data.get('description', ''),
                        improvement_suggestion=weakness_data.get('improvement_suggestion', '')
                    )
        
        # Calculate overall score and domains mastered after ALL domains are created
        student.calculate_overall_score()
        student.update_domains_mastered()
        
        return student

    def update(self, instance, validated_data):
        # Track if course is changing
        course = validated_data.get('course')
        if course and course != instance.course:
            instance._course_changed = True
        
        # Update fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance


class AnnouncementSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    course_names = serializers.SerializerMethodField()
    is_read = serializers.SerializerMethodField()
    is_scheduled = serializers.SerializerMethodField()
    
    class Meta:
        model = Announcement
        fields = [
            'id', 'title', 'content', 'courses', 'course_names',
            'created_by', 'created_by_name', 'is_active', 'priority',
            'scheduled_start', 'scheduled_end', 'is_scheduled',
            'created_at', 'updated_at', 'is_read'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']
    
    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() or obj.created_by.email
    
    def get_course_names(self, obj):
        return [course.name for course in obj.courses.all()]
    
    def get_is_read(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'student':
            try:
                student = Student.objects.get(user=request.user)
                return AnnouncementRead.objects.filter(student=student, announcement=obj).exists()
            except Student.DoesNotExist:
                return False
        return False
    
    def get_is_scheduled(self, obj):
        """Check if announcement has scheduling"""
        return bool(obj.scheduled_start or obj.scheduled_end)


class AnnouncementCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = ['id', 'title', 'content', 'courses', 'is_active', 'priority', 'scheduled_start', 'scheduled_end']
    
    def validate(self, data):
        """Validate that end date is after start date"""
        if data.get('scheduled_start') and data.get('scheduled_end'):
            if data['scheduled_end'] <= data['scheduled_start']:
                raise serializers.ValidationError({
                    'scheduled_end': 'End date must be after start date'
                })
        return data


class ProjectSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    reviewed_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = [
            'id', 'student', 'student_name', 'title', 'description', 
            'project_url', 'submission_date', 'status', 'grade', 'feedback',
            'reviewed_by', 'reviewed_by_name', 'reviewed_at', 
            'technologies_used', 'created_at', 'updated_at'
        ]
        read_only_fields = ['submission_date', 'reviewed_by', 'reviewed_at', 'created_at', 'updated_at']
    
    def get_student_name(self, obj):
        return obj.student.user.get_full_name() or obj.student.user.email
    
    def get_reviewed_by_name(self, obj):
        if obj.reviewed_by:
            return obj.reviewed_by.get_full_name() or obj.reviewed_by.email
        return None


class ProjectCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'title', 'description', 'project_url', 'technologies_used']


class ProjectReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['status', 'grade', 'feedback']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'title', 'message', 
            'related_project', 'route_url', 'is_read', 'read_at', 'created_at'
        ]
        read_only_fields = ['created_at', 'read_at']
