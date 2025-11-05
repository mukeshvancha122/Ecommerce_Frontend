from django.core import mail
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings


class Util:
    @staticmethod
    def send_email(data):

        plain_message = strip_tags(data["email_body"])
        email = EmailMultiAlternatives(
            subject=data["subject"],
            body=plain_message,
            from_email=settings.EMAIL_HOST_USER,
            to=[data["email"]],
        )
        email.attach_alternative(data["email_body"], "text/html")
        email.send(fail_silently=False)

    @staticmethod
    def send_purchase_invoice(order, discount, payment_method):
        subject = f"Purchase Invoice - Order #{order.order_code}"
        from_email = settings.EMAIL_HOST_USER
        to = order.order_by.email

        html_content = render_to_string(
            "purchase_invoice.html",
            {"order": order, "discount": discount, "payment":payment_method},
        )
        text_content = strip_tags(html_content)

        email = EmailMultiAlternatives(subject, text_content, from_email, [to])
        email.attach_alternative(html_content, "text/html")
        email.send(fail_silently=False)
