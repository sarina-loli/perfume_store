from django.conf import settings
from django.db import models

from products.models import Product


class Order(models.Model):
    # 'pending'   -> created at checkout, payment not yet confirmed
    # 'paid'      -> payment confirmed by the payment provider
    # 'failed'    -> payment attempt failed (declined, insufficient stock at confirmation, etc.)
    # 'cancelled' -> the customer abandoned/cancelled checkout before paying
    # 'completed' -> paid order that has since been fulfilled/shipped (set manually by staff)
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    tax = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Order #{self.id} ({self.user.username})'


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    # Kept nullable + a name/price snapshot so an order still displays
    # correctly even if the product is later changed or removed.
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, related_name='+')
    product_name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    quantity = models.PositiveIntegerField()
