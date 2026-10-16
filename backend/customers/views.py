from rest_framework import viewsets, permissions
from .models import Customer
from .serializers import CustomerSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    """Write requires admin role; read allows any authenticated user."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        return bool(request.user and request.user.is_authenticated and request.user.is_admin_role)


class CustomerViewSet(viewsets.ModelViewSet):
    """
    CRUD for customers.
    list/retrieve: any authenticated user.
    create/update/delete: admin only.
    """
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAdminOrReadOnly]
    search_fields = ['name', 'email', 'company']
    ordering_fields = ['name', 'created_at', 'lifetime_value']
    filterset_fields = ['status']
