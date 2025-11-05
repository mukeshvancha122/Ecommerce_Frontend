from django.db import models

from imagera.orders.models import Orders
from imagera.users.models import User

# Create your models here.
class OrderPayment(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL,
                             null=True, related_name="user_order_payment")
    amount = models.PositiveIntegerField()
    order_code = models.ForeignKey(Orders, on_delete=models.SET_NULL, null=True, related_name="order_payment")
    payment_token = models.CharField(max_length=20, null=True)
    payment_date = models.DateTimeField(auto_now_add=True)
    is_paid = models.BooleanField(default=False)
    payment_method = models.CharField(max_length=120, null=True)

    def __str__(self):
        return 'Amount {} Paid for Order ID {} on {}'.format(self.amount, self.order_code, self.payment_date)
