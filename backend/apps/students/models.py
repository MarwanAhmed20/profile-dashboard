from django.db import models
from django.conf import settings


class Student(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='student_profile')
    student_id = models.CharField(max_length=50, unique=True)
    grade_level = models.CharField(max_length=50)
    overall_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'students'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.student_id})"


class Domain(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'domains'
        ordering = ['order', 'name']

    def __str__(self):
        return self.name


class StudentDomainScore(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='domain_scores')
    domain = models.ForeignKey(Domain, on_delete=models.CASCADE)
    score = models.DecimalField(max_digits=5, decimal_places=2)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'student_domain_scores'
        unique_together = ('student', 'domain')

    def __str__(self):
        return f"{self.student.user.username} - {self.domain.name}: {self.score}"
