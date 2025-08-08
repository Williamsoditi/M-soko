from rest_framework import serializers
from .models import Address, CustomUser 
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token # 👈 New: Import Token model

# Get the currently active user model from settings.py
User = get_user_model()

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile_picture']
        read_only_fields = ['username']
        extra_kwargs = {
            'email': {'required': True},
        }

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exclude(id=self.instance.id if self.instance else None).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User 
        fields = ['id', 'username', 'email']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    token = serializers.CharField(read_only=True) # 👈 New: Add a read-only token field

    class Meta:
        model = User 
        fields = ['username', 'email', 'password', 'password2', 'token'] # 👈 New: Add 'token' to fields
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, data):
        # Check that the two passwords match
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match.")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        # Use the correct user model to create the new user
        user = User.objects.create_user(**validated_data)
        
        # 👈 New: Create an auth token for the newly created user
        token = Token.objects.create(user=user)
        user.token = token.key
        
        return user
    
class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'
        read_only_fields = ['user']