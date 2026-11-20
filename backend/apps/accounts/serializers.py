from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, UserRole

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'department', 'approval_limit', 'vendor_id', 'is_active_employee', 'created_at']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=UserRole.choices, default=UserRole.FINANCE_EMPLOYEE)
    department = serializers.CharField(default='Accounts Payable', required=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'role', 'department']

    def create(self, validated_data):
        role = validated_data.pop('role', UserRole.FINANCE_EMPLOYEE)
        dept = validated_data.pop('department', 'Accounts Payable')
        password = validated_data.pop('password')
        
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()

        UserProfile.objects.create(
            user=user,
            role=role,
            department=dept
        )
        return user
