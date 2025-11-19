from django.contrib.auth.management.commands import createsuperuser
from django.core.management import CommandError


class Command(createsuperuser.Command):
    help = 'Create a superuser with email instead of username'

    def add_arguments(self, parser):
        super().add_arguments(parser)
        parser.add_argument(
            '--admin-code',
            dest='admin_code',
            default=None,
            help='Admin code for the superuser',
        )

    def handle(self, *args, **options):
        email = options.get('email')
        admin_code = options.get('admin_code')
        
        # Set username to email automatically
        if email:
            options['username'] = email
        
        # Call parent handle
        user = super().handle(*args, **options)
        
        # Set admin code if provided
        if user and admin_code:
            from apps.users.models import User
            user_obj = User.objects.get(email=email)
            user_obj.admin_code = admin_code.upper()
            user_obj.save()
            self.stdout.write(self.style.SUCCESS(f'Admin code set to: {user_obj.admin_code}'))
        
        return user
