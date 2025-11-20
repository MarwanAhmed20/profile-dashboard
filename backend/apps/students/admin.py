from django.contrib import admin
from .models import Student, Domain, StudentDomainScore, Course, Announcement


class StudentDomainScoreInline(admin.TabularInline):
    model = StudentDomainScore
    extra = 1


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('student_id', 'get_full_name', 'overall_score', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('student_id', 'user__username', 'user__first_name', 'user__last_name', 'user__email')
    inlines = [StudentDomainScoreInline]
    readonly_fields = ('student_id',)
    
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


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('name', 'duration_weeks', 'start_date', 'end_date', 'is_active', 'get_domain_count')
    list_filter = ('is_active', 'start_date')
    search_fields = ('name', 'description')
    filter_horizontal = ('domains',)
    
    def get_domain_count(self, obj):
        return obj.domains.count()
    get_domain_count.short_description = 'Domains'


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('title', 'priority', 'is_active', 'created_by', 'created_at')
    list_filter = ('priority', 'is_active', 'created_at')
    search_fields = ('title', 'content')
    filter_horizontal = ('courses',)
    readonly_fields = ('created_at', 'updated_at')
