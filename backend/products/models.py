from django.db import models


class Product(models.Model):
    """A single perfume in the collection."""

    name = models.CharField(max_length=200)
    tagline = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    size = models.CharField(max_length=100)
    img = models.ImageField(upload_to='products/')
    # CSS gradient string used for the colored accent bar on the product card.
    accent = models.CharField(max_length=200)
    # A simple list of fragrance notes, e.g. ["Fresh Rose", "White Peony"].
    notes = models.JSONField(default=list)
    description = models.TextField()

    class Meta:
        ordering = ['id']

    def __str__(self):
        return self.name
