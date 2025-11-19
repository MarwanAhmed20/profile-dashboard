from django.db import models
from django.conf import settings
import uuid


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


class Course(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    duration_weeks = models.IntegerField(help_text="Number of weeks for the course")
    domains = models.ManyToManyField(Domain, related_name='courses')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'courses'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.duration_weeks} weeks)"


class Student(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='student_profile')
    student_id = models.CharField(max_length=50, unique=True, editable=False)
    overall_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    
    # Course relationship
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True, related_name='students')
    
    # New fields
    program = models.CharField(max_length=100, default='AI-Capsule')
    next_milestone = models.CharField(max_length=200, default='Portfolio checkpoint')
    domains_mastered = models.IntegerField(default=0)
    total_domains = models.IntegerField(default=10)
    overall_summary = models.TextField(blank=True)
    trainer_feedback = models.TextField(blank=True)
    program_start_date = models.DateField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'students'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        # Track if this is a new instance
        is_new = self.pk is None
        
        # Generate student_id before saving
        if not self.student_id:
            # Get the last student to determine the next number
            last_student = Student.objects.order_by('-id').first()
            if last_student and last_student.student_id.startswith('CAP-ST-'):
                try:
                    last_number = int(last_student.student_id.split('-')[-1])
                    next_number = last_number + 1
                except (ValueError, IndexError):
                    next_number = 1
            else:
                next_number = 1
            
            # Try to generate unique student ID
            max_attempts = 100
            for attempt in range(max_attempts):
                student_id = f"CAP-ST-{next_number:02d}"
                
                # Check if this ID already exists
                if not Student.objects.filter(student_id=student_id).exists():
                    self.student_id = student_id
                    break
                
                # If exists, increment and try again
                next_number += 1
            else:
                # If all attempts failed, use UUID as fallback
                import uuid
                self.student_id = f"CAP-ST-{uuid.uuid4().hex[:6].upper()}"
        
        # Don't sync domains during initial save to avoid issues
        skip_sync = kwargs.pop('skip_sync', False)
        
        # Call parent save
        super().save(*args, **kwargs)
        
        # Sync domains after save if course is set and not a new instance
        if not is_new and self.course and not skip_sync:
            self.sync_domains_with_course()

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.student_id})"
    
    def calculate_overall_score(self):
        """Calculate overall score as average of all domain scores as percentage"""
        domain_scores = self.domain_scores.all()
        if domain_scores.exists():
            total = sum(float(ds.score) for ds in domain_scores)
            count = domain_scores.count()
            # Calculate average percentage
            average = total / count
            self.overall_score = round(average, 2)

            self.save(update_fields=['overall_score', 'updated_at'])
            
        else:
            self.overall_score = 0.0
            self.save(update_fields=['overall_score', 'updated_at'])
        return self.overall_score
    
    def update_domains_mastered(self, mastery_threshold=80.0):
        """Update count of domains mastered (score >= threshold)"""
        self.domains_mastered = self.domain_scores.filter(score__gte=mastery_threshold).count()
        self.save(update_fields=['domains_mastered'])
        return self.domains_mastered
    
    def sync_domains_with_course(self):
        """Sync student's domains with their course's domains"""
        if not self.course:
            return
        
        course_domains = self.course.domains.all()
        existing_scores = {ds.domain_id: ds for ds in self.domain_scores.all()}
        
        # Add new domains from course
        for domain in course_domains:
            if domain.id not in existing_scores:
                StudentDomainScore.objects.create(
                    student=self,
                    domain=domain,
                    score=0
                )
        
        # Remove domains not in course
        course_domain_ids = set(domain.id for domain in course_domains)
        for domain_score in self.domain_scores.all():
            if domain_score.domain_id not in course_domain_ids:
                domain_score.delete()

    def record_weekly_progress(self):
        """Record current week's progress"""
        from datetime import datetime, timedelta
        
        # Get start date from course or program_start_date
        start_date = None
        if self.course and self.course.start_date:
            start_date = self.course.start_date
        elif self.program_start_date:
            start_date = self.program_start_date
        
        if not start_date:
            return
        
        # Calculate current week number
        current_date = datetime.now().date()
        days_diff = (current_date - start_date).days
        current_week = (days_diff // 7) + 1
        
        # Calculate current average score
        domain_scores = self.domain_scores.all()
        if domain_scores.exists():
            avg_score = sum(float(ds.score) for ds in domain_scores) / domain_scores.count()
        else:
            avg_score = 0
        
        # Calculate week start date
        week_start = start_date + timedelta(weeks=current_week - 1)
        
        # Update or create weekly progress record
        WeeklyProgress.objects.update_or_create(
            student=self,
            week_number=current_week,
            defaults={
                'week_start_date': week_start,
                'average_score': round(avg_score, 1)
            }
        )

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

    def save(self, *args, **kwargs):
        # Check if we should skip auto-calculation (controlled by kwarg)
        skip_calculation = kwargs.pop('skip_calculation', False)
        
        # For bulk_create, skip signal processing
        if kwargs.get('force_insert', False):
            skip_calculation = True
        
        super().save(*args, **kwargs)
        
        # Only auto-calculate if not explicitly skipped
        if not skip_calculation:
            self.student.calculate_overall_score()
            self.student.update_domains_mastered()
            self.student.record_weekly_progress()
    
    def delete(self, *args, **kwargs):
        student = self.student
        super().delete(*args, **kwargs)
        # Recalculate after deletion
        student.calculate_overall_score()
        student.update_domains_mastered()


class DomainStrength(models.Model):
    student_domain = models.ForeignKey(StudentDomainScore, on_delete=models.CASCADE, related_name='strengths')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'domain_strengths'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student_domain.domain.name} - Strength: {self.title}"


class DomainWeakness(models.Model):
    student_domain = models.ForeignKey(StudentDomainScore, on_delete=models.CASCADE, related_name='weaknesses')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    improvement_suggestion = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'domain_weaknesses'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student_domain.domain.name} - Weakness: {self.title}"


class WeeklyProgress(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='weekly_progress')
    week_number = models.IntegerField()
    week_start_date = models.DateField()
    average_score = models.DecimalField(max_digits=5, decimal_places=2)
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'weekly_progress'
        ordering = ['week_number']
        unique_together = ('student', 'week_number')

    def __str__(self):
        return f"{self.student.user.username} - Week {self.week_number}: {self.average_score}%"