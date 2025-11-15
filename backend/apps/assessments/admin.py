from django.contrib import admin
from .models import Assessment, AssessmentDetail


class AssessmentDetailInline(admin.TabularInline):
    model = AssessmentDetail
    extra = 0


@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'domain', 'score', 'date_taken')
    list_filter = ('domain', 'date_taken')
    search_fields = ('student__user__username', 'domain__name')
    inlines = [AssessmentDetailInline]
    date_hierarchy = 'date_taken'


@admin.register(AssessmentDetail)
class AssessmentDetailAdmin(admin.ModelAdmin):
    list_display = ('assessment', 'is_correct', 'points_earned', 'points_possible')
    list_filter = ('is_correct',)
