from django.core.management.base import BaseCommand
from apps.students.models import Student
from apps.users.models import User

class Command(BaseCommand):
    help = 'Delete all student accounts (keeps admin accounts)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirm deletion of all students',
        )

    def handle(self, *args, **options):
        if not options['confirm']:
            self.stdout.write(
                self.style.WARNING(
                    'This will delete ALL student accounts and their data.\n'
                    'Run with --confirm flag to proceed.\n'
                    'Example: python manage.py clear_students --confirm'
                )
            )
            return

        # Get all students
        students = Student.objects.all()
        count = students.count()

        if count == 0:
            self.stdout.write(self.style.WARNING('No students found.'))
            return

        # Get all student users
        student_users = User.objects.filter(role='student')
        user_count = student_users.count()

        self.stdout.write(f'Found {count} student profiles and {user_count} student users.')
        
        # Delete students (this will cascade to domain scores)
        students.delete()
        self.stdout.write(self.style.SUCCESS(f'✓ Deleted {count} student profiles'))

        # Delete student user accounts
        student_users.delete()
        self.stdout.write(self.style.SUCCESS(f'✓ Deleted {user_count} student user accounts'))

        self.stdout.write(self.style.SUCCESS('\n✅ All students cleared successfully!'))
