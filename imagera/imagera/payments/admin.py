from django.contrib import admin

from imagera.payments.models import OrderPayment

# Register your models here.
admin.site.register([OrderPayment])