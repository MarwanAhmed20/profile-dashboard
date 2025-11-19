from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.EMAIL_FIELD

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Replace username field with email field
        self.fields[self.username_field] = serializers.EmailField()
        self.fields.pop('username', None)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'role')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)
    course_id = serializers.IntegerField(write_only=True, required=True)
    admin_code = serializers.CharField(write_only=True, required=True, max_length=20, min_length=6)

    class Meta:
        model = User
        fields = ('email', 'password', 'password2', 'first_name', 'last_name', 'role', 'course_id', 'admin_code')

    def validate_email(self, value):
        """Validate that email is not already registered"""
        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError("A user with this email already exists")
        return value.lower()

    def validate_password(self, value):
        """Validate password strength"""
        import re
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long")
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Password must contain uppercase letter")
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("Password must contain lowercase letter")
        if not re.search(r'[0-9]', value):
            raise serializers.ValidationError("Password must contain a number")
        if not re.search(r'[!@#$%^&*]', value):
            raise serializers.ValidationError("Password must contain special character (!@#$%^&*)")
        return value

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Passwords do not match"})
        return data
    
    def validate_course_id(self, value):
        """Validate that course exists and is active"""
        from apps.students.models import Course
        try:
            Course.objects.get(id=value, is_active=True)
        except Course.DoesNotExist:
            raise serializers.ValidationError("Selected course is not available")
        return value
    
    def validate_admin_code(self, value):
        """Validate that admin code exists and belongs to an admin"""
        if len(value) < 6:
            raise serializers.ValidationError("Admin code must be at least 6 characters")
        
        try:
            User.objects.get(admin_code=value.upper(), role='admin')
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid admin code")
        return value.upper()

    def create(self, validated_data):
        from apps.students.models import Student, Course, StudentDomainScore
        from django.db import transaction
        import logging
        logger = logging.getLogger(__name__)
        
        validated_data.pop('password2')
        password = validated_data.pop('password')
        course_id = validated_data.pop('course_id')
        admin_code = validated_data.pop('admin_code')
        
        # Always set role to student for registration
        validated_data['role'] = 'student'
        validated_data['username'] = validated_data['email']
        
        try:
            with transaction.atomic():
                # Create user
                user = User.objects.create_user(**validated_data)
                user.set_password(password)
                user.save()
                
                logger.info(f"User created: {user.email}")
                
                # Get the course
                course = Course.objects.get(id=course_id, is_active=True)
                
                # Get admin user
                admin = User.objects.get(admin_code=admin_code, role='admin')
                
                # Create student profile
                student = Student.objects.create(
                    user=user,
                    course=course,
                    program=course.name,
                    program_start_date=course.start_date,
                    total_domains=course.domains.count()
                )
                
                logger.info(f"Student created: {student.student_id}")
                
                # Delete any existing domain scores (shouldn't exist, but just in case)
                StudentDomainScore.objects.filter(student=student).delete()
                
                # Create fresh domain scores for all course domains
                domain_scores = []
                for domain in course.domains.all():
                    domain_score = StudentDomainScore(
                        student=student,
                        domain=domain,
                        score=0
                    )
                    domain_scores.append(domain_score)
                
                # Bulk create all domain scores at once
                StudentDomainScore.objects.bulk_create(domain_scores, ignore_conflicts=True)
                
                logger.info(f"Created {len(domain_scores)} domain scores for student: {student.student_id}")
                
            # Send email notification (outside transaction)
            try:
                from django.core.mail import send_mail
                from django.conf import settings
                
                send_mail(
                    subject=f'New Student Registration: {user.get_full_name()}',
                    message=f"""
Hello {admin.first_name},

A new student has registered using your admin code ({admin_code}):

Name: {user.get_full_name()}
Email: {user.email}
Course: {course.name}
Student ID: {student.student_id}

Please review their profile in the admin dashboard.

Best regards,
AI-Capsule Team
                    """.strip(),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[admin.email],
                    fail_silently=True,
                )
            except Exception as e:
                logger.error(f"Failed to send notification email: {e}")
            
            return user
                
        except Exception as e:
            logger.error(f"Registration failed: {str(e)}")
            # Re-raise to trigger rollback
            raise
