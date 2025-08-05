# orders/serializers.py
from rest_framework import serializers
from products.serializers import ProductSerializer
from .models import Cart, CartItem, Order, OrderItem, Payment

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True) # Nested serializer to get product details

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Cart
        fields = ['id', 'items']

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'items', 'status', 'total_amount', 'created_at']
        read_only_fields = ['user', 'status', 'total_amount']

class CheckoutSerializer(serializers.Serializer):
    # This serializer will be used to validate the payment data
    payment_method = serializers.CharField(max_length=20)
    # You can add more fields depending on the payment method
    # For M-Pesa:
    phone_number = serializers.CharField(max_length=15, required=False)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)