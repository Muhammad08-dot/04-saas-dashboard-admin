"""
Dashboard stats endpoints — aggregates for the admin panel charts.
"""
from datetime import time, datetime, timedelta

from django.db.models import Sum
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from customers.models import Customer
from orders.models import Order


class StatsView(APIView):
    """
    GET /api/dashboard/stats/
    Returns: total_customers, total_revenue, orders_this_month, recent_revenue_series.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        total_customers = Customer.objects.count()
        total_revenue = Order.objects.filter(status=Order.Status.COMPLETED).aggregate(
            total=Sum('amount')
        )['total'] or 0
        orders_this_month = Order.objects.filter(created_at__gte=month_start).count()

        # 30-day revenue series for the chart
        series = []
        for i in range(29, -1, -1):
            day = (now - timedelta(days=i)).date()
            day_start = timezone.make_aware(datetime.combine(day, time.min))
            day_end = day_start + timedelta(days=1)
            revenue = Order.objects.filter(
                status=Order.Status.COMPLETED,
                created_at__gte=day_start,
                created_at__lt=day_end,
            ).aggregate(total=Sum('amount'))['total'] or 0
            series.append({'date': day.isoformat(), 'revenue': float(revenue)})

        return Response({
            'total_customers': total_customers,
            'total_revenue': float(total_revenue),
            'orders_this_month': orders_this_month,
            'revenue_series': series,
        })
