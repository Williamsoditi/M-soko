from rest_framework import serializers
from .models import *

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True) 

    class Meta:
        model = Product
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    status = serializers.CharField(read_only=True)
    is_visible = serializers.BooleanField(read_only=True) 
    class Meta:
        model = Review
        fields = ['id', 'user', 'username', 'product', 'rating', 'comment', 'created_at', 'status', 'is_visible']
        read_only_fields = ['user', 'product']