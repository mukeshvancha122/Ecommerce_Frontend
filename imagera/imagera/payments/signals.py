# from django.dispatch import receiver, Signal
# from django.utils import timezone

# from mountemart.notification.models import IndividualNotification


# payment_completed = Signal()
# out_for_delivery = Signal()
# delivery_completed = Signal()


# @receiver(payment_completed)
# def send_payment_notification(sender, user, order_info, **kwargs):
#     subject = "Order Placed!"
#     notification_text = (
#         f"Your order with ordercode:{order_info} has been successfully processed."
#     )
#     notification = IndividualNotification.objects.create(
#         user=user, subject=subject, notification_text=notification_text
#     )
#     notification.send(user)


# @receiver(out_for_delivery)
# def send_delivery_notification(sender, user, order_info, **kwargs):
#     subject = "Order to be delivered!"
#     notification_text = (
#         f"Your order with ordercode:{order_info} is out for delivery. Our Delivery Partner will attempt to deliver your order today!"
#     )
#     notification = IndividualNotification.objects.create(
#         user=user, subject=subject, notification_text=notification_text
#     )
#     notification.send(user)


# @receiver(delivery_completed)
# def send_delivery_notification(sender, user, order_info, **kwargs):
#     subject = "Order Delivered!"
#     notification_text = (
#         f"Your order with ordercode:{order_info} has been successfully delivered."
#     )
#     notification = IndividualNotification.objects.create(
#         user=user, subject=subject, notification_text=notification_text
#     )
#     notification.send(user)
