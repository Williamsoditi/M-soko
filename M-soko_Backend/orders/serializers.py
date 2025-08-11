# orders/serializers.py

from rest_framework import serializers
from django.db.models import Sum 

from products.serializers import ProductSerializer
from products.models import Product 

from .models import Cart, CartItem, Order, OrderItem

# --- Nested Serializers for Items ---

class CartItemSerializer(serializers.ModelSerializer):
    """
    Serializes individual cart items.
    """
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'total_price']
        # The 'quantity' field must be writable to allow updates
        read_only_fields = ['id', 'total_price']

    def get_total_price(self, obj):
        return obj.quantity * obj.product.price
    
    def update(self, instance, validated_data):
        instance.quantity = validated_data.get('quantity', instance.quantity)
        instance.save()
        return instance

    def create(self, validated_data):
        """
        Handles creation of new cart items or updating existing ones.
        """
        user = self.context['request'].user
        product_id = validated_data.get('product_id')
        quantity = validated_data.get('quantity')
        
        cart, _ = Cart.objects.get_or_create(user=user, is_active=True)
        existing_items = CartItem.objects.filter(cart=cart, product_id=product_id)
        
        if existing_items.exists():
            # If item exists, update its quantity and save
            first_item = existing_items.first()
            first_item.quantity += quantity
            first_item.save()
            existing_items.exclude(id=first_item.id).delete() # Delete duplicates if any
            return first_item
        else:
            # If the item doesn't exist, create a new one
            product = Product.objects.get(id=product_id)
            return CartItem.objects.create(cart=cart, product=product, quantity=quantity)


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price', 'total_price']
        read_only_fields = ['price', 'total_price']

    def get_total_price(self, obj):
        return obj.quantity * obj.price


# --- Main Cart and Order Serializers ---

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_price', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['user', 'is_active', 'created_at', 'updated_at']

    def get_total_price(self, obj):
        return sum(item.quantity * item.product.price for item in obj.items.all())


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'items', 'total_amount', 'status', 'created_at']
        read_only_fields = ['user', 'total_amount', 'status', 'created_at']


class OrderHistorySerializer(serializers.ModelSerializer):
    """
    Serializer for the Order model to display order history.
    """
    items = OrderItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField() 
    
    class Meta:
        model = Order
        fields = ['id', 'items', 'total_price', 'status', 'created_at'] # Include total_price here
        

    def get_total_price(self, obj):
        
        return sum(item.price * item.quantity for item in obj.items.all())