from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'role', 'admin_code', 'is_staff', 'date_joined')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    search_fields = ('email', 'first_name', 'last_name', 'admin_code')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name')}),
        ('Admin Code', {
            'fields': ('admin_code',),
            'description': 'Set a unique code for admins. Students need this code to register.'
        }),
        ('Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2', 'role'),
        }),
        ('Admin Code (Optional)', {
            'classes': ('wide',),
            'fields': ('admin_code',),
            'description': 'Set a unique admin code if this user is an admin'
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        # Make admin_code read-only for non-admin roles
        if obj and obj.role != 'admin':
            return self.readonly_fields + ('admin_code',)
        return self.readonly_fields
