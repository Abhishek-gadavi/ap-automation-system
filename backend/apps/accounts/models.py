import uuid
from django.db import models
from django.contrib.auth.models import User

class UserRole(models.TextChoices):
    ADMIN = 'ADMIN', 'System Administrator'
    FINANCE_EMPLOYEE = 'FINANCE_EMPLOYEE', 'Finance / Accounts Payable Employee'
    APPROVER_MANAGER = 'APPROVER_MANAGER', 'Manager / Approver'
    VENDOR = 'VENDOR', 'Vendor Representative'

class UserProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=32, choices=UserRole.choices, default=UserRole.FINANCE_EMPLOYEE)
    phone = models.CharField(max_length=20, blank=True, null=True)
    department = models.CharField(max_length=100, default='Accounts Payable')
    approval_limit = models.DecimalField(max_digits=15, decimal_places=2, default=50000.00)
    vendor_id = models.UUIDField(null=True, blank=True, help_text="Linked vendor ID if role is VENDOR")
    is_active_employee = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_profiles'

    def __str__(self):
        return f"{self.user.username} ({self.role})"
