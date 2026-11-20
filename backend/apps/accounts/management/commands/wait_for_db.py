"""
Django command to wait for the PostgreSQL database to be available.
"""
import time
from django.core.management.base import BaseCommand
from django.db import connections
from django.db.utils import OperationalError

class Command(BaseCommand):
    help = 'Waits for database to be ready'

    def handle(self, *args, **options):
        self.stdout.write('Waiting for PostgreSQL database...')
        db_conn = None
        attempts = 0
        while not db_conn and attempts < 30:
            try:
                db_conn = connections['default']
                db_conn.cursor()
                self.stdout.write(self.style.SUCCESS('PostgreSQL Database is available!'))
                return
            except OperationalError:
                attempts += 1
                self.stdout.write(f'Database unavailable, waiting 1 second... (attempt {attempts}/30)')
                time.sleep(1)

        self.stdout.write(self.style.WARNING('Database wait timed out, proceeding anyway.'))
