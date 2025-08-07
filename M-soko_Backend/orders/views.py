
from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.db import transaction
from django.db.models import F

from .models import Cart, CartItem, Order, OrderItem
from .serializers import CartSerializer, CartItemSerializer, OrderSerializer, OrderItemSerializer

class CartViewSet(viewsets.ModelViewSet):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user, ordered=False)

class CartItemViewSet(viewsets.ModelViewSet):
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Ensure a user can only see their own cart items
        return self.queryset.filter(cart__user=self.request.user)

    def perform_create(self, serializer):
        # A user's cart is automatically created if it doesn't exist
        cart, created = Cart.objects.get_or_create(user=self.request.user, ordered=False)
        
        # Check if the product is already in the cart
        product = serializer.validated_data.get('product')
        cart_item = CartItem.objects.filter(cart=cart, product=product).first()

        if cart_item:
            # If the item exists, just update the quantity
            cart_item.quantity = F('quantity') + serializer.validated_data.get('quantity')
            cart_item.save()
            serializer.instance = cart_item
        else:
            # If the item is new, create it
            serializer.save(cart=cart)


class CheckoutView(generics.CreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        user = self.request.user
        cart = Cart.objects.filter(user=user, ordered=False).first()

        if not cart or not cart.items.exists(): # <-- Use .items.exists() for the new model
            return Response({"error": "Your cart is empty."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            with transaction.atomic():
                order = Order.objects.create(user=user, cart=cart) # <-- Set the cart field here
                total_amount = 0

                for cart_item in cart.items.all(): # <-- Use .items.all()
                    # Create an OrderItem from the CartItem
                    OrderItem.objects.create(
                        order=order,
                        product=cart_item.product,
                        quantity=cart_item.quantity,
                        price=cart_item.product.price
                    )
                    
                    product = cart_item.product
                    product.stock -= cart_item.quantity
                    product.save()

                    total_amount += cart_item.quantity * cart_item.product.price

                order.total_amount = total_amount
                order.save()

                cart.ordered = True # <-- Mark the cart as ordered
                cart.save()

                serializer = self.get_serializer(order)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class OrderHistoryView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUser]