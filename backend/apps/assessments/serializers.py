from rest_framework import serializers
from .models import Assessment, AssessmentDetail


class AssessmentDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentDetail
        fields = '__all__'


class AssessmentSerializer(serializers.ModelSerializer):
    details = AssessmentDetailSerializer(many=True, read_only=True)
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    domain_name = serializers.CharField(source='domain.name', read_only=True)
    
    class Meta:
        model = Assessment
        fields = '__all__'
