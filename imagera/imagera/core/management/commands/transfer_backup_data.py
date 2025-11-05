from django.core.mail import send_mail
from django.core.management.base import BaseCommand
from django.conf import settings


class Command(BaseCommand):
    help = 'Transfers backup data to email'

    def handle(self, *args, **options):
        # Get the backup file path
        backup_file_path = '/var/lib/docker/volumes/imagera_production_postgres_data/_data'  # Update with your backup file path

        # Compose the email
        email = send_mail(
            'Backup Data',
            'Please find the backup data attached.',
            settings.DEFAULT_FROM_EMAIL,
            "princeprem76@gmail.com",
        )

        # Attach the backup file
        email.attach_file(backup_file_path)

        # Send the email
        email.send()

        # Print a success message
        self.stdout.write(self.style.SUCCESS('Backup data transferred successfully.'))
