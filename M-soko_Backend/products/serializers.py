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
    
    # This field allows passing category ID when creating/updating
    category_id = serializers.IntegerField(write_only=True, required=False) 
    
    # This field provides the direct Cloudinary URL for the image
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        # Include 'stock' in the fields list so it can be serialized and deserialized
        fields = ['id', 'name', 'description', 'price', 'stock', 'image', 'image_url', 'category', 'category_id']
        # 'id', 'category' (nested object), and 'image_url' (calculated) are read-only
        read_only_fields = ['id', 'category', 'image_url']

    def get_image_url(self, obj):
        if obj.image:
            cloud_name = getattr(settings, 'CLOUDINARY_CLOUD_NAME', None)
            if cloud_name:
                # Ensure the format matches what Cloudinary provides for direct image access
                # obj.image is usually the public_id, so combine with base URL
                return f"https://res.cloudinary.com/{cloud_name}/image/upload/{obj.image.public_id}"
        return None

    def create(self, validated_data):
        category_id = validated_data.pop('category_id', None)
        stock = validated_data.pop('stock', 0) # Pop stock to handle it explicitly

        category = None
        if category_id:
            try:
                category = Category.objects.get(id=category_id)
            except Category.DoesNotExist:
                raise serializers.ValidationError({"category_id": "Category with this ID does not exist."})

        product = Product.objects.create(category=category, stock=stock, **validated_data)
        return product

    def update(self, instance, validated_data):
        if 'category_id' in validated_data:
            category_id = validated_data.pop('category_id')
            try:
                instance.category = Category.objects.get(id=category_id)
            except Category.DoesNotExist:
                raise serializers.ValidationError({"category_id": "Category with this ID does not exist."})
        
        # Update stock if it's provided in the validated data
        instance.stock = validated_data.get('stock', instance.stock)

        # Update other fields dynamically
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    status = serializers.CharField(read_only=True)
    is_visible = serializers.BooleanField(read_only=True) 
    class Meta:
        model = Review
        fields = ['id', 'user', 'username', 'product', 'rating', 'comment', 'created_at', 'status', 'is_visible']
        read_only_fields = ['user', 'product']
