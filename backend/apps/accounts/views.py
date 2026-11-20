from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from .models import UserProfile, UserRole
from .serializers import UserProfileSerializer, RegisterSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
        profile = getattr(user, 'profile', None)
        token['role'] = profile.role if profile else 'FINANCE_EMPLOYEE'
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        profile = getattr(self.user, 'profile', None)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'role': profile.role if profile else 'FINANCE_EMPLOYEE',
            'department': profile.department if profile else 'Accounts Payable'
        }
        return data

class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class CurrentUserProfileView(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            # Return demo profile if unauthenticated in development
            return Response({
                'username': 'abhishek.admin',
                'email': 'admin@templegate.example.com',
                'role': 'ADMIN',
                'department': 'Finance & Operations',
                'approval_limit': 10000000.00
            })
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        return Response(UserProfileSerializer(profile).data)

class UserListView(generics.ListAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
