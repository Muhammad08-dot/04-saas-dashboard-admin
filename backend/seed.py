"""
Seed script — run with: python seed.py
Creates demo users, customers, and orders with realistic data.
Idempotent: safe to run multiple times (clears and re-seeds).
"""
import os
import random
import sys
from pathlib import Path
from datetime import timedelta

sys.path.insert(0, str(Path(__file__).resolve().parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from customers.models import Customer
from orders.models import Order

User = get_user_model()

COMPANIES = [
    'Nexvia Technologies', 'Orchid Health', 'Bramble Logistics',
    'Quartz Financial', 'Lumen Education', 'Drift Media',
    'Atlas Manufacturing', 'Copperfield Legal', 'Solstice Energy',
    'Pinecrest Retail', 'Vertex Analytics', 'Cobalt Studios',
    'Meridian Freight', 'Lakeshore Health', 'Pratt & Koenig',
    'Northstar Foods', 'Vantage Steel', 'Cedar Point Clinics',
    'Redwood Ventures', 'Silverline Transport', 'Apex Consulting',
    'Ironclad Security', 'Beacon Insurance', 'Cascade Biotech',
]

FIRST_NAMES = [
    'Maria', 'James', 'Priya', 'Derek', 'Yuki', 'Samuel', 'Fatima',
    'Lucas', 'Nina', 'Omar', 'Elena', 'Tobias', 'Zara', 'Felix',
    'Anika', 'Marcus', 'Celia', 'Jonas', 'Rhea', 'Viktor',
]
LAST_NAMES = [
    'Santos', 'Whitfield', 'Kapoor', 'Marchetti', 'Tanaka', 'Okonkwo',
    'Hassan', 'Lindgren', 'Petrov', 'Alvarez', 'Chen', 'Bergström',
    'Novak', 'Ferreira', 'Yamamoto', 'Kowalski', 'Dubois', 'Andersson',
    'Reyes', 'Volkov',
]


def seed():
    print('Clearing existing data...')
    Order.objects.all().delete()
    Customer.objects.all().delete()
    User.objects.all().delete()

    # Users
    admin = User.objects.create_superuser(
        username='admin', email='admin@saaspanel.io', password='Admin@2025!',
        first_name='Rachel', last_name='Torres', role='admin', company='SaaSPanel Inc.',
    )
    user = User.objects.create_user(
        username='viewer', email='viewer@saaspanel.io', password='Viewer@2025!',
        first_name='Tom', last_name='Henricks', role='user', company='Acme Corp',
    )
    print(f'Created users: admin/{admin.email}, viewer/{user.email}')

    # Customers
    customers = []
    for i, company in enumerate(COMPANIES):
        c = Customer.objects.create(
            name=f'{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}',
            email=f'contact@{company.lower().replace(" ", "").replace("&", "")}.com',
            company=company,
            status=random.choice(['active', 'active', 'active', 'inactive', 'churned']),
            lifetime_value=round(random.uniform(200, 45000), 2),
        )
        customers.append(c)
    print(f'Created {len(customers)} customers.')

    # Orders
    now = timezone.now()
    orders_created = 0
    for customer in customers:
        num_orders = random.randint(2, 12)
        for _ in range(num_orders):
            order = Order.objects.create(
                customer=customer,
                amount=round(random.uniform(29, 2499), 2),
                plan=random.choice(['starter', 'pro', 'enterprise']),
                status=random.choice(['completed', 'completed', 'completed', 'pending', 'cancelled', 'refunded']),
            )
            # Backdate created_at randomly within last 90 days
            offset = timedelta(days=random.randint(0, 90), hours=random.randint(0, 23))
            Order.objects.filter(pk=order.pk).update(created_at=now - offset)
            orders_created += 1
    print(f'Created {orders_created} orders.')
    print('Done. Login: admin@saaspanel.io / Admin@2025!')


if __name__ == '__main__':
    seed()
