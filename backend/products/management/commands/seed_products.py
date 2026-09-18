from django.core.management.base import BaseCommand

from products.models import Product

PRODUCTS = [
    {
        'name': 'Victoria Bloom',
        'tagline': 'Pink',
        'price': 185,
        'size': '50ml Eau de Parfum',
        'img': 'https://images.unsplash.com/photo-1630573133526-8d090e0269af?w=600&h=800&fit=crop&auto=format',
        'accent': 'linear-gradient(90deg, #F4A7C3, #DDA8D8)',
        'notes': ['Fresh Rose', 'White Peony', 'Musk', 'Bergamot'],
        'description': (
            'A luminous floral bouquet capturing the first light of dawn. Victoria Bloom '
            'opens with a burst of fresh roses and white peony, softening into a warm musky '
            'heart that lingers like a morning embrace. Delicate, feminine, and utterly '
            'unforgettable.'
        ),
        'category': 'floral',
        'stock': 24,
    },
    {
        'name': 'Victoria Noir',
        'tagline': 'Ivory',
        'price': 210,
        'size': '50ml Eau de Parfum',
        'img': 'https://images.unsplash.com/photo-1606391484561-e1831bf6a8a0?w=600&h=800&fit=crop&auto=format',
        'accent': 'linear-gradient(90deg, #D8CFC4, #C8C0B8)',
        'notes': ['Dark Oud', 'Amber', 'Sandalwood', 'Vanilla'],
        'description': (
            'Darkness refined into silk. Victoria Noir is an opulent journey through deep oud '
            'and precious amber, anchored by aged sandalwood and a whisper of vanilla. A '
            'fragrance of quiet power, undeniable allure, and timeless mystery.'
        ),
        'category': 'oriental',
        'stock': 15,
    },
    {
        'name': 'Victoria Royale',
        'tagline': 'Gold',
        'price': 260,
        'size': '75ml Eau de Parfum',
        'img': 'https://images.unsplash.com/photo-1770301410072-f6ef6dad65b2?w=600&h=800&fit=crop&auto=format',
        'accent': 'linear-gradient(90deg, #D4AF37, #C9903C)',
        'notes': ['Iris', 'Champagne', 'Golden Amber', 'Cashmere'],
        'description': (
            'Crown yourself. Victoria Royale is the pinnacle of the collection — a statement '
            'of luxury worn only by those who define it. Iris and champagne notes shimmer '
            'with golden amber before settling into the softest cashmere finish.'
        ),
        'category': 'oriental',
        'stock': 8,
    },
    {
        'name': 'Victoria Mist',
        'tagline': 'Blue',
        'price': 195,
        'size': '50ml Eau de Parfum',
        'img': 'https://images.unsplash.com/photo-1615160460366-2c9a41771b51?w=600&h=800&fit=crop&auto=format',
        'accent': 'linear-gradient(90deg, #94C8E0, #7BB8D8)',
        'notes': ['Sea Salt', 'Aquatic Lily', 'Driftwood', 'White Musk'],
        'description': (
            'The ocean made wearable. Victoria Mist captures the freedom of open water — cool '
            'sea salt and aquatic lily mingling with the warmth of sun-bleached driftwood and '
            'white musk. Effortlessly light, hauntingly evocative.'
        ),
        'category': 'fresh',
        'stock': 30,
    },
]


class Command(BaseCommand):
    help = 'Seeds the database with the four Victoria perfumes shown on the frontend.'

    def handle(self, *args, **options):
        created_count = 0
        for data in PRODUCTS:
            _, created = Product.objects.update_or_create(
                name=data['name'], defaults=data
            )
            if created:
                created_count += 1

        self.stdout.write(self.style.SUCCESS(
            f'Done. {created_count} product(s) created, '
            f'{len(PRODUCTS) - created_count} already existed and were updated.'
        ))
