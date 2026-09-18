from django.db import models


class Payment(models.Model):
    """
    One row per checkout attempt. An Order can end up with more than one
    Payment over time if the customer abandons a session and tries again,
    but only ever one 'succeeded' Payment.
    """

    STATUS_CHOICES = [
        ('pending', 'Pending'),      # session created, not yet confirmed
        ('succeeded', 'Succeeded'),  # confirmed paid, order finalized
        ('failed', 'Failed'),        # payment declined / stock unavailable at confirmation
        ('cancelled', 'Cancelled'),  # customer abandoned or explicitly cancelled checkout
    ]

    order = models.OneToOneField(
        'orders.Order', on_delete=models.CASCADE, related_name='payment'
    )
    provider = models.CharField(max_length=20, default='stripe')
    session_id = models.CharField(max_length=255, unique=True)
    payment_intent_id = models.CharField(max_length=255, blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='usd')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Payment #{self.id} for Order #{self.order_id} ({self.status})'
