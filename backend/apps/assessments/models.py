from django.db import models
from apps.students.models import Student, Domain


class Assessment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='assessments')
    domain = models.ForeignKey(Domain, on_delete=models.CASCADE)
    score = models.DecimalField(max_digits=5, decimal_places=2)
    date_taken = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = 'assessments'
        ordering = ['-date_taken']

    def __str__(self):
        return f"{self.student.user.username} - {self.domain.name} - {self.score}"


class AssessmentDetail(models.Model):
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='details')
    question = models.TextField()
    answer = models.TextField()
    is_correct = models.BooleanField(default=False)
    points_earned = models.DecimalField(max_digits=5, decimal_places=2)
    points_possible = models.DecimalField(max_digits=5, decimal_places=2)

    class Meta:
        db_table = 'assessment_details'

    def __str__(self):
        return f"Detail for Assessment {self.assessment.id}"
