# products/serializers.py

from rest_framework import serializers
from django.conf import settings
from .models import *

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True) 
    
    # This line tells DRF that 'image_url' is not a model field.
    # Its value will come from the get_image_url method below.
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        # Include the custom 'image_url' field and the original 'image' field if needed
        # Or, to be cleaner, replace 'image' with 'image_url' in the list
        fields = ['id', 'name', 'description', 'price', 'stock', 'image_url', 'category']

    def get_image_url(self, obj):
        if obj.image:
            cloud_name = getattr(settings, 'CLOUDINARY_CLOUD_NAME', None)
            if cloud_name:
                return f"https://res.cloudinary.com/{cloud_name}/{obj.image}"
        return None

class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    status = serializers.CharField(read_only=True)
    is_visible = serializers.BooleanField(read_only=True) 
    class Meta:
        model = Review
        fields = ['id', 'user', 'username', 'product', 'rating', 'comment', 'created_at', 'status', 'is_visible']
        read_only_fields = ['user', 'product']