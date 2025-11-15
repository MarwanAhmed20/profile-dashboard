#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the path
sys.path.insert(0, os.path.dirname(__file__))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User
from apps.students.models import Domain, Student, StudentDomainScore

print("\n" + "="*50)
print("Setting up initial data...")
print("="*50 + "\n")

# Create domains
domains_data = [
    {'name': 'Mathematics', 'description': 'Math skills and problem solving', 'order': 1},
    {'name': 'Science', 'description': 'Scientific knowledge and inquiry', 'order': 2},
    {'name': 'Reading', 'description': 'Reading comprehension and literacy', 'order': 3},
    {'name': 'Writing', 'description': 'Written communication skills', 'order': 4},
    {'name': 'Social Studies', 'description': 'History and social sciences', 'order': 5},
]

print("Creating domains...")
for d in domains_data:
    domain, created = Domain.objects.get_or_create(name=d['name'], defaults=d)
    if created:
        print(f"  ✓ Created domain: {domain.name}")
    else:
        print(f"  - Domain already exists: {domain.name}")

# Create admin user
print("\nCreating admin user...")
try:
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@example.com',
            'first_name': 'Admin',
            'last_name': 'User',
            'role': 'admin',
            'is_staff': True,
            'is_superuser': True,
        }
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        print(f"  ✓ Created admin user: {admin_user.username} (password: admin123)")
    else:
        print(f"  - Admin user already exists: {admin_user.username}")
except Exception as e:
    print(f"  ✗ Error creating admin: {e}")

# Create sample students
print("\nCreating sample students...")
students_data = [
    {
        'username': 'john_doe',
        'email': 'john@example.com',
        'first_name': 'John',
        'last_name': 'Doe',
        'student_id': 'STU001',
        'grade_level': '10th Grade',
        'overall_score': 85.5,
        'scores': [92, 88, 85, 80, 90]
    },
    {
        'username': 'jane_smith',
        'email': 'jane@example.com',
        'first_name': 'Jane',
        'last_name': 'Smith',
        'student_id': 'STU002',
        'grade_level': '11th Grade',
        'overall_score': 90.0,
        'scores': [95, 92, 88, 87, 93]
    },
    {
        'username': 'bob_wilson',
        'email': 'bob@example.com',
        'first_name': 'Bob',
        'last_name': 'Wilson',
        'student_id': 'STU003',
        'grade_level': '9th Grade',
        'overall_score': 78.0,
        'scores': [80, 75, 78, 82, 76]
    }
]

domains = Domain.objects.all().order_by('order')

for student_data in students_data:
    try:
        student_user, created = User.objects.get_or_create(
            username=student_data['username'],
            defaults={
                'email': student_data['email'],
                'first_name': student_data['first_name'],
                'last_name': student_data['last_name'],
                'role': 'student',
            }
        )
        
        if created:
            student_user.set_password('student123')
            student_user.save()
            print(f"  ✓ Created student user: {student_user.username} (password: student123)")
            
            # Create student profile
            student, _ = Student.objects.get_or_create(
                user=student_user,
                defaults={
                    'student_id': student_data['student_id'],
                    'grade_level': student_data['grade_level'],
                    'overall_score': student_data['overall_score'],
                }
            )
            
            # Add domain scores
            for domain, score in zip(domains, student_data['scores']):
                StudentDomainScore.objects.get_or_create(
                    student=student,
                    domain=domain,
                    defaults={'score': score}
                )
            print(f"    - Added {len(student_data['scores'])} domain scores")
        else:
            print(f"  - Student user already exists: {student_user.username}")
    except Exception as e:
        print(f"  ✗ Error creating student {student_data['username']}: {e}")

print("\n" + "="*50)
print("✅ Initial data setup complete!")
print("="*50)
print("\nLogin credentials:")
print("  Admin:    username=admin,     password=admin123")
print("  Student1: username=john_doe,  password=student123")
print("  Student2: username=jane_smith, password=student123")
print("  Student3: username=bob_wilson, password=student123")
print("\nAPI Base URL: http://localhost:8000/api/")
print("Admin Panel: http://localhost:8000/admin/")
print("="*50 + "\n")
