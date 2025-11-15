from rest_framework import viewsets, permissions
from .models import Assessment, AssessmentDetail
from .serializers import AssessmentSerializer, AssessmentDetailSerializer


class AssessmentViewSet(viewsets.ModelViewSet):
    queryset = Assessment.objects.all().select_related('student__user', 'domain')
    serializer_class = AssessmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'admin':
            return self.queryset
        return self.queryset.filter(student__user=self.request.user)
