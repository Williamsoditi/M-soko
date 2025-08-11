from rest_framework import serializers
from django.db.models import Sum  # Required for aggregating quantities

from products.serializers import ProductSerializer  # Ensure this import is correct
from products.models import Product # Ensure Product model is imported

from .models import Cart, CartItem, Order, OrderItem

# --- Nested Serializers for Items ---

class CartItemSerializer(serializers.ModelSerializer):
    """
    Serializes individual cart items.
    It includes product details and calculates the total price for the item.
    """
    product = ProductSerializer(read_only=True)  # To show product details when reading
    product_id = serializers.IntegerField(write_only=True) # To accept product_id when writing
    total_price = serializers.SerializerMethodField() # Calculated field for item's total price

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'total_price']
        read_only_fields = ['id', 'total_price'] # ID and total_price are generated/calculated

    def get_total_price(self, obj):
        """
        Calculates the total price for a single CartItem (quantity * product price).
        """
        return obj.quantity * obj.product.price
    
    def update(self, instance, validated_data):
        # Update the quantity field if it's present in the request data
        instance.quantity = validated_data.get('quantity', instance.quantity)
        instance.save()
        return instance

    def create(self, validated_data):
        """
        Handles creation of new cart items or updating existing ones.
        It ensures an active cart exists for the user and correctly adds/updates items.
        """
        user = self.context['request'].user
        product_id = validated_data.get('product_id')
        quantity = validated_data.get('quantity')
        
        # Get or create the active cart for the user
        cart, _ = Cart.objects.get_or_create(user=user, is_active=True)
        
        # Check if the product already exists in this cart
        existing_items = CartItem.objects.filter(cart=cart, product_id=product_id)
        
        if existing_items.exists():
            # If duplicates exist, consolidate them into one item
            total_quantity = existing_items.aggregate(total_q=Sum('quantity'))['total_q'] or 0
            final_quantity = total_quantity + quantity
            
            # Update the first existing item and delete others
            first_item = existing_items.first()
            first_item.quantity = final_quantity
            first_item.save()
            existing_items.exclude(id=first_item.id).delete() # Delete duplicates
            
            return first_item
        else:
            # If the item doesn't exist, create a new one
            product = Product.objects.get(id=product_id)
            return CartItem.objects.create(cart=cart, product=product, quantity=quantity)


class OrderItemSerializer(serializers.ModelSerializer):
    """
    Serializes individual order items for an order history or detailed order view.
    """
    product = ProductSerializer(read_only=True) # To display product details
    total_price = serializers.SerializerMethodField() # Calculated field for item's total price

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price', 'total_price']
        read_only_fields = ['price', 'total_price'] # Price is fixed at order creation, total is calculated

    def get_total_price(self, obj):
        """
        Calculates the total price for a single OrderItem (quantity * price at order time).
        """
        return obj.quantity * obj.price


# --- Main Cart and Order Serializers ---

class CartSerializer(serializers.ModelSerializer):
    """
    Serializes a full cart, including its nested items and total price.
    """
    # This is crucial: 'items' field to include all related CartItem objects
    items = CartItemSerializer(many=True, read_only=True, ) # Use 'items' as related_name in Cart model
    total_price = serializers.SerializerMethodField() # Calculated field for cart's grand total

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_price', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['user', 'is_active', 'created_at', 'updated_at']

    def get_total_price(self, obj):
        """
        Calculates the total price of all items in the cart by summing item total_prices.
        """
        return sum(item.quantity * item.product.price for item in obj.items.all())


class OrderSerializer(serializers.ModelSerializer):
    """
    Serializes a complete order with its items for detailed viewing.
    """
    items = OrderItemSerializer(many=True, read_only=True, source='items') # Use 'items' as related_name in OrderItem model
    # Note: Using 'total_amount' as per your Order model field, not 'total_price'
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'items', 'total_amount', 'status', 'created_at']
        read_only_fields = ['user', 'total_amount', 'status', 'created_at']


class OrderHistorySerializer(OrderSerializer):
    """
    Serializes a completed order for the user's order history.
    Inherits from OrderSerializer to reuse its fields and nesting.
    """
    class Meta(OrderSerializer.Meta):
        # Extend the fields if you need specific ones for history, like shipping_address
        fields = OrderSerializer.Meta.fields + ['shipping_address'] 


# --- Other Serializers ---

class CheckoutSerializer(serializers.Serializer):
    """
    A simple serializer to validate the cart_id for checkout.
    """
    cart_id = serializers.IntegerField()