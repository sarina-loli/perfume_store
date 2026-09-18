from django.db import models


class Product(models.Model):
    """A single perfume in the collection."""

    CATEGORY_CHOICES = [
        ('floral', 'Floral'),
        ('woody', 'Woody'),
        ('oriental', 'Oriental'),
        ('fresh', 'Fresh'),
    ]

    name = models.CharField(max_length=200)
    tagline = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    size = models.CharField(max_length=100)
    img = models.URLField(max_length=500)
    # CSS gradient string used for the colored accent bar on the product card.
    accent = models.CharField(max_length=200)
    # A simple list of fragrance notes, e.g. ["Fresh Rose", "White Peony"].
    notes = models.JSONField(default=list)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='floral')
    # Units currently available. Decremented only once a payment is confirmed.
    stock = models.PositiveIntegerField(default=20)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return self.name

    @property
    def in_stock(self):
        return self.stock > 0
