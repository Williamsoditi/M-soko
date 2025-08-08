from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework import generics

from .models import Cart, CartItem, Order, OrderItem
from .serializers import CartSerializer, CartItemSerializer, OrderHistorySerializer, CheckoutSerializer

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

    def perform_create(self, serializer):
        # Get or create the active cart for the authenticated user
        cart, created = Cart.objects.get_or_create(user=self.request.user, is_active=True)

        # Extract the product from the validated data
        product = serializer.validated_data.get('product')
        quantity = serializer.validated_data.get('quantity', 1)

        # Check if the item already exists in the cart
        existing_item = CartItem.objects.filter(cart=cart, product=product).first()
        
        if existing_item:
            # If it exists, update the quantity
            existing_item.quantity += quantity
            existing_item.save()
            serializer.instance = existing_item
        else:
            # If not, create a new cart item
            serializer.save(cart=cart)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

class CheckoutView(APIView):
    """
    Handles the checkout process.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # 1. Get the user's active cart
        try:
            cart = Cart.objects.get(user=request.user, is_active=True)
        except Cart.DoesNotExist:
            return Response({"detail": "No active cart found."}, status=status.HTTP_404_NOT_FOUND)

        if not cart.items.exists():
            return Response({"detail": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Create a new order
        order = Order.objects.create(
            user=request.user,
            total_price=cart.total_price,
            status='processing'
        )

        # 3. Move items from cart to order
        for cart_item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                price=cart_item.product.price
            )

        # 4. Deactivate the cart
        cart.is_active = False
        cart.save()

        # You can add payment processing logic here

        return Response({"detail": "Checkout successful! Your order has been placed."}, status=status.HTTP_200_OK)

class OrderHistoryView(generics.ListAPIView):
    """
    Lists the order history for the authenticated user.
    """
    serializer_class = OrderHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')