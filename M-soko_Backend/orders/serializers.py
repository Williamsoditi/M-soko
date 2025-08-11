from rest_framework import serializers

from products.serializers import ProductSerializer  # Assuming you have this
from .models import Cart, CartItem, Order, OrderItem, Product

# --- Nested Serializers for Items ---

class CartItemSerializer(serializers.ModelSerializer):
    """
    Serializes individual cart items for a cart.
    The nested ProductSerializer provides product details.
    """
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity']

    def create(self, validated_data):
        product_id = validated_data.pop('product_id')
        product = Product.objects.get(id=product_id)
        
        # Now, create the CartItem with the actual Product object
        return CartItem.objects.create(product=product, **validated_data)


class OrderItemSerializer(serializers.ModelSerializer):
    """
    Serializes individual order items for an order history view.
    """
    product = ProductSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price']
        read_only_fields = ['price']


# --- Main Cart and Order Serializers ---

class CartSerializer(serializers.ModelSerializer):
    """
    Serializes a full cart, including its nested items.
    """
    items = CartItemSerializer(many=True, read_only=True, source='cartitem_set')
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_price']
        read_only_fields = ['user']

    def get_total_price(self, obj):
        """
        Calculates the total price of all items in the cart.
        """
        return sum(item.total_price for item in obj.items.all())


class OrderHistorySerializer(serializers.ModelSerializer):
    """
    Serializes a completed order for the user's order history.
    """
    items = OrderItemSerializer(many=True, read_only=True, source='orderitem_set')

    class Meta:
        model = Order
        fields = ['id', 'user', 'total_price', 'status', 'created_at', 'items']
        read_only_fields = ['user', 'total_price', 'status', 'created_at']

# --- Other Serializers ---

class CheckoutSerializer(serializers.Serializer):
    """
    A simple serializer to validate the cart_id for checkout.
    """
    cart_id = serializers.IntegerField()