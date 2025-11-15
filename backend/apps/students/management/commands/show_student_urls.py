from django.core.management.base import BaseCommand
from django.urls import get_resolver

class Command(BaseCommand):
    help = 'Show all student-related URLs'

    def handle(self, *args, **options):
        resolver = get_resolver()
        for pattern in resolver.url_patterns:
            if 'students' in str(pattern.pattern):
                self.stdout.write(str(pattern.pattern))
