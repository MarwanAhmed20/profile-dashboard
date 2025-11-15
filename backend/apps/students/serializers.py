from rest_framework import serializers
from .models import Student, Domain, StudentDomainScore
from apps.users.serializers import UserSerializer


class DomainSerializer(serializers.ModelSerializer):
    class Meta:
        model = Domain
        fields = '__all__'


class StudentDomainScoreSerializer(serializers.ModelSerializer):
    domain_name = serializers.CharField(source='domain.name', read_only=True)
    
    class Meta:
        model = StudentDomainScore
        fields = ('id', 'domain', 'domain_name', 'score', 'updated_at')


class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    domain_scores = StudentDomainScoreSerializer(many=True, read_only=True)
    
    class Meta:
        model = Student
        fields = '__all__'


class StudentCreateUpdateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(write_only=True, required=True)
    first_name = serializers.CharField(write_only=True, required=True)
    last_name = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    domains = serializers.ListField(child=serializers.DictField(), write_only=True, required=False)
    
    class Meta:
        model = Student
        fields = ('id', 'student_id', 'grade_level', 'overall_score', 'username', 'email', 
                  'first_name', 'last_name', 'password', 'domains')

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
            password = 'student123'  # Default password
        
        domains_data = validated_data.pop('domains', [])
        
        # Create user
        user = User.objects.create_user(**user_data, password=password)
        
        # Create student
        student = Student.objects.create(user=user, **validated_data)
        
        # Add domain scores
        for domain_data in domains_data:
            StudentDomainScore.objects.create(
                student=student,
                domain_id=domain_data['domain_id'],
                score=domain_data['score']
            )
        
        return student

    def update(self, instance, validated_data):
        user_data = {}
        for field in ['username', 'email', 'first_name', 'last_name']:
            if field in validated_data:
                user_data[field] = validated_data.pop(field)
        
        password = validated_data.pop('password', None)
        domains_data = validated_data.pop('domains', None)
        
        # Update user
        if user_data:
            for key, value in user_data.items():
                setattr(instance.user, key, value)
            if password:
                instance.user.set_password(password)
            instance.user.save()
        
        # Update student
        for key, value in validated_data.items():
            setattr(instance, key, value)
        instance.save()
        
        # Update domain scores
        if domains_data is not None:
            instance.domain_scores.all().delete()
            for domain_data in domains_data:
                StudentDomainScore.objects.create(
                    student=instance,
                    domain_id=domain_data['domain_id'],
                    score=domain_data['score']
                )
        
        return instance
