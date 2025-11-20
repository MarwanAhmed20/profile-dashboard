from django.core.management.base import BaseCommand
from apps.students.models import Notification

class Command(BaseCommand):
    help = 'Delete read notifications older than 2 days'

    def handle(self, *args, **options):
        deleted_count = Notification.delete_old_read_notifications()
        self.stdout.write(
            self.style.SUCCESS(f'Successfully deleted {deleted_count} old notifications')
        )
