from django.contrib import admin
from .models import Student, Domain, StudentDomainScore


class StudentDomainScoreInline(admin.TabularInline):
    model = StudentDomainScore
    extra = 1


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('student_id', 'get_full_name', 'grade_level', 'overall_score', 'created_at')
    list_filter = ('grade_level', 'created_at')
    search_fields = ('student_id', 'user__username', 'user__first_name', 'user__last_name')
    inlines = [StudentDomainScoreInline]
    
    def get_full_name(self, obj):
        return obj.user.get_full_name()
    get_full_name.short_description = 'Name'


@admin.register(Domain)
class DomainAdmin(admin.ModelAdmin):
    list_display = ('name', 'order', 'created_at')
    list_editable = ('order',)
    ordering = ('order', 'name')


@admin.register(StudentDomainScore)
class StudentDomainScoreAdmin(admin.ModelAdmin):
    list_display = ('student', 'domain', 'score', 'updated_at')
    list_filter = ('domain', 'updated_at')
    search_fields = ('student__user__username', 'domain__name')
