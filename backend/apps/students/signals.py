from django.db.models.signals import m2m_changed
from django.dispatch import receiver
from .models import Course

@receiver(m2m_changed, sender=Course.domains.through)
def sync_students_on_course_domains_change(sender, instance, action, **kwargs):
    """When course domains change, sync all enrolled students"""
    if action in ['post_add', 'post_remove', 'post_clear']:
        # Update all students enrolled in this course
        for student in instance.students.all():
            student.sync_domains_with_course()
