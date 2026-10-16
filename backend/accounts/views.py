from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model

from .serializers import RegisterSerializer, UserSerializer, LoginSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """Public endpoint: create a new account."""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(TokenObtainPairView):
    """JWT login — returns access + refresh tokens and user data."""
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]


class MeView(generics.RetrieveUpdateAPIView):
    """Authenticated user: view or update own profile."""
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
