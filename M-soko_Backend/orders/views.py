
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from django.db import transaction 
from rest_framework.exceptions import PermissionDenied, ValidationError 

from .models import Cart, CartItem, Order, OrderItem
from products.models import Product 

from .serializers import CartSerializer, CartItemSerializer, OrderHistorySerializer
from rest_framework.mixins import DestroyModelMixin, ListModelMixin, RetrieveModelMixin

class CartViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A viewset for viewing a user's cart.
    """
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user, is_active=True)

class CartItemViewSet(viewsets.ModelViewSet):
    """
    A viewset for managing items in a user's cart.
    """
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            cart, created = Cart.objects.get_or_create(user=self.request.user, is_active=True)
            return CartItem.objects.filter(cart=cart)
        return CartItem.objects.none()
    
class OrderViewSet(ListModelMixin, RetrieveModelMixin, DestroyModelMixin, viewsets.GenericViewSet):
    """
    A viewset for viewing, retrieving, and deleting a user's orders.
    This serves as the user's personal order history.
    """
    serializer_class = OrderHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Ensure users can only see and delete their own orders
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_destroy(self, instance):
        # Ensure only the owner can delete the order
        if instance.user != self.request.user:
            raise PermissionDenied("You do not have permission to delete this order.")
        instance.delete()

class CheckoutView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        user = request.user
        
        try:
            cart = get_object_or_404(Cart, user=user, is_active=True)

            if not cart.items.exists():
                return Response({'detail': 'Your cart is empty. Nothing to checkout.'}, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                # 1. First, check stock availability for all items in the cart
                # This loop runs before any OrderItems are created or stock is decremented.
                for cart_item in cart.items.all():
                    product = cart_item.product
                    if product.stock < cart_item.quantity:
                        # If stock is insufficient, raise an error to stop the transaction
                        raise ValidationError(f"Insufficient stock for product: '{product.name}'. Available: {product.stock}, Requested: {cart_item.quantity}")

                # 2. Create a new order instance
                new_order = Order.objects.create(user=user)
                order_total_sum = 0 # Initialize the sum for the order total

                # 3. Process each cart item: create OrderItem and decrement product stock
                for cart_item in cart.items.all():
                    # Use select_for_update() to lock the product row for concurrency safety.
                    # This prevents race conditions if multiple users try to buy the last item simultaneously.
                    product = Product.objects.select_for_update().get(id=cart_item.product.id) 
                    
                    item_price = product.price 
                    item_quantity = cart_item.quantity

                    # Create an OrderItem linking to the new order and product
                    OrderItem.objects.create(
                        order=new_order,
                        product=product,
                        quantity=item_quantity,
                        price=item_price # Save the price at the time of purchase for historical accuracy
                    )
                    
                    # Decrement the product's stock and save the updated product
                    product.stock -= item_quantity
                    product.save() 

                    # Accumulate the total price for the new order
                    order_total_sum += item_price * item_quantity 

                # 4. Save the calculated total_amount to the new order instance
                new_order.total_amount = order_total_sum
                new_order.save() 

                # 5. Deactivate the user's current active cart (it's now been converted to an order)
                cart.is_active = False
                cart.save()

                return Response(
                    {'detail': 'Checkout successful! Your order has been placed.', 'order_id': new_order.id},
                    status=status.HTTP_201_CREATED
                )

        except Cart.DoesNotExist:
            return Response(
                {'detail': 'No active cart found for this user.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValidationError as e: # Catch specific validation errors (like insufficient stock)
            transaction.set_rollback(True) # IMPORTANT: Rollback all changes made in the atomic block
            return Response(
                {'detail': str(e)}, # Return the specific validation error message to the frontend
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e: # Catch any other unexpected errors during the process
            print(f"Checkout error: {e}") # Log the specific error for server-side debugging
            transaction.set_rollback(True) # IMPORTANT: Rollback all changes for any unexpected error
            return Response(
                {'detail': 'An unexpected error occurred during checkout. Please try again or contact support.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
