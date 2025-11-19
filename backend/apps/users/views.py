from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, RegisterSerializer, EmailTokenObtainPairSerializer
from rest_framework.decorators import api_view, permission_classes
import logging

User = get_user_model()

logger = logging.getLogger(__name__)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        logger.info(f"Registration attempt with data: {request.data.keys()}")
        
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            
            return Response(
                {
                    'success': True,
                    'message': 'Registration successful! You can now login.',
                    'email': serializer.validated_data.get('email')
                },
                status=status.HTTP_201_CREATED,
                headers=headers
            )
        except Exception as e:
            logger.error(f"Registration error: {str(e)}")
            return Response(
                {
                    'error': str(e),
                    'detail': 'Registration failed'
                },
                status=status.HTTP_400_BAD_REQUEST
            )


class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def manage_admin_code(request):
    """Allow admins to view and update their admin code"""
    if request.user.role != 'admin':
        return Response(
            {'error': 'Only admins can manage admin codes'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if request.method == 'GET':
        return Response({
            'admin_code': request.user.admin_code,
            'email': request.user.email,
            'name': request.user.get_full_name()
        })
    
    elif request.method == 'POST':
        new_code = request.data.get('admin_code', '').strip().upper()
        
        if not new_code:
            return Response(
                {'error': 'Admin code cannot be empty'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(new_code) < 6:
            return Response(
                {'error': 'Admin code must be at least 6 characters'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(new_code) > 20:
            return Response(
                {'error': 'Admin code must not exceed 20 characters'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not new_code.isalnum():
            return Response(
                {'error': 'Admin code must contain only letters and numbers'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if code is already taken by another admin
        from apps.users.models import User
        if User.objects.filter(admin_code=new_code).exclude(id=request.user.id).exists():
            return Response(
                {'error': 'This admin code is already in use'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        request.user.admin_code = new_code
        request.user.save()
        
        return Response({
            'success': True,
            'admin_code': new_code,
            'message': 'Admin code updated successfully'
        })
