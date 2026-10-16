from rest_framework import viewsets, permissions
from .models import Order
from .serializers import OrderSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        return bool(request.user and request.user.is_authenticated and request.user.is_admin_role)


class OrderViewSet(viewsets.ModelViewSet):
    """CRUD for orders. Admin writes; any auth user reads."""
    queryset = Order.objects.select_related('customer').all()
    serializer_class = OrderSerializer
    permission_classes = [IsAdminOrReadOnly]
    search_fields = ['customer__name', 'customer__email']
    ordering_fields = ['created_at', 'amount', 'status']
    filterset_fields = ['status', 'plan']
