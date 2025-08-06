from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .serializers import UserRegistrationSerializer
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from .serializers import UserSerializer, AddressSerializer
from .models import Address
from django.contrib.auth.models import User



class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A viewset that provides the `list` and `retrieve` actions for users.
    Only allows access to admin users.
    """
    queryset = User.objects.all().order_by('username')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

class UserRegistrationView(APIView):
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # You can also create a token for the user immediately after registration
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'user_id': user.pk}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)

        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'user_id': user.pk}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
        
class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Ensure a user can only see and manage their own addresses.
        """
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """
        Save the authenticated user as the owner of the new address.
        """
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        """
        Prevent a user from changing an address to another user's.
        """
        serializer.save(user=self.request.user)