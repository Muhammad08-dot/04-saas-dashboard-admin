from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user with role field for RBAC."""

    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        USER = 'user', 'User'

    role = models.CharField(max_length=10, choices=Role.choices, default=Role.USER)
    company = models.CharField(max_length=200, blank=True)

    @property
    def is_admin_role(self):
        return self.role == self.Role.ADMIN
