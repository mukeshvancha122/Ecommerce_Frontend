# from celery import shared_task
# from django.utils import timezone
# from django.core.cache import cache
# from datetime import timedelta
# from imagera.orders.models import Orders
# from imagera.product.models import Products
# import random

# @shared_task
# def generate_top_products():
#     yesterday = timezone.now() - timedelta(days=1)
#     orders = Orders.objects.filter(order_date=yesterday.date())

#     product_counts = {}
#     for order in orders:
#         for items in order.item.all():
#             product_id = items.item.product.id
#             if product_id in product_counts:
#                 product_counts[product_id] += items.quantity
#             else:
#                 product_counts[product_id] = items.quantity

#     top_products = sorted(product_counts.items(), key=lambda x: x[1], reverse=True)
#     top_product_ids = [product_id for product_id, count in top_products][:30]

#     # If there are less than 30 products, fill the rest with random products
#     if len(top_product_ids) < 30:
#         all_product_ids = list(Products.objects.values_list('id', flat=True))
#         random_product_ids = random.sample(all_product_ids, 30 - len(top_product_ids))
#         top_product_ids.extend(random_product_ids)

#     # Store the product IDs in cache
#     cache.set('top_products', top_product_ids, None)
