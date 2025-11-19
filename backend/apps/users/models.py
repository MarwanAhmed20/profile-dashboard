from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20,
        choices=[('admin', 'Admin'), ('student', 'Student')],
        default='student'
    )
    admin_code = models.CharField(
        max_length=20, 
        blank=True, 
        null=True, 
        unique=True,
        help_text="Unique code for student registration (admins only, minimum 6 characters)"
    )
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    # Remove username requirement
    username = models.CharField(max_length=150, blank=True, null=True)
    
    class Meta:
        db_table = 'users'
    
    def save(self, *args, **kwargs):
        # Set username to email if not provided
        if not self.username:
            self.username = self.email
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.email
