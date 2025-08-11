from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework import generics
from django.db import transaction
from .models import Cart, CartItem, Order, OrderItem
from .serializers import CartSerializer, CartItemSerializer, OrderHistorySerializer
from rest_framework.mixins import DestroyModelMixin, ListModelMixin, RetrieveModelMixin

class CartViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A viewset for viewing and creating a user's cart.
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
        # Ensure we only work with the current user's cart items
        if self.request.user.is_authenticated:
            cart, created = Cart.objects.get_or_create(user=self.request.user, is_active=True)
            return CartItem.objects.filter(cart=cart)
        return CartItem.objects.none()

    # 👈 FIX: We remove the custom perform_create method here
    # The default behavior of the viewset will now call the serializer's create method
    # which contains all the correct logic.

    # def update(self, request, *args, **kwargs):
    #     partial = kwargs.pop('partial', False)
    #     instance = self.get_object()
    #     serializer = self.get_serializer(instance, data=request.data, partial=partial)
    #     serializer.is_valid(raise_exception=True)
    #     self.perform_update(serializer)
    #     return Response(serializer.data)
        
class CheckoutView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        user = request.user
        
        try:
            # 1. Get the user's active cart
            cart = get_object_or_404(Cart, user=user, is_active=True)

            if not cart.items.exists():
                return Response({'detail': 'Your cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                # 2. Create a new order for the user
                new_order = Order.objects.create(user=user)

                # 3. Move cart items to the new order as order items
                for cart_item in cart.items.all():
                    OrderItem.objects.create(
                        order=new_order,
                        product=cart_item.product,
                        quantity=cart_item.quantity,
                        price=cart_item.product.price # Save the price at the time of purchase
                    )
                
                # 4. Deactivate the old cart
                cart.is_active = False
                cart.save()

                # 5. Return success response
                return Response(
                    {'detail': 'Checkout successful! Your order has been placed.'},
                    status=status.HTTP_201_CREATED
                )

        except Cart.DoesNotExist:
            return Response(
                {'detail': 'No active cart found for this user.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            # Catch any other unexpected errors during the process
            print(f"Checkout error: {e}")
            return Response(
                {'detail': 'An unexpected error occurred during checkout.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        

class OrderHistoryView(generics.ListAPIView):
    # ... (rest of your OrderHistoryView)
    serializer_class = OrderHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')