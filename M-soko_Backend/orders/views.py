from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from .models import Cart, CartItem, Order, OrderItem, Payment
from products.models import Product
from .serializers import CartSerializer, OrderSerializer, CheckoutSerializer

class CartViewSet(viewsets.ModelViewSet):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Ensure a user can only have one cart
        try:
            Cart.objects.get(user=self.request.user)
        except Cart.DoesNotExist:
            serializer.save(user=self.request.user)

class CartItemViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only show cart items for the authenticated user's cart
        return CartItem.objects.filter(cart__user=self.request.user)

    def create(self, request, *args, **kwargs):
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)
        
        try:
            cart = Cart.objects.get(user=request.user)
            product = Product.objects.get(id=product_id)
        except (Cart.DoesNotExist, Product.DoesNotExist):
            return Response({'error': 'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)

        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        
        if not created:
            cart_item.quantity += int(quantity)
            cart_item.save()
        else:
            cart_item.quantity = int(quantity)
            cart_item.save()

        return Response(CartSerializer(cart).data, status=status.HTTP_201_CREATED)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # A user can only see their own orders
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

    def create(self, request, *args, **kwargs):
        # This will be replaced by the checkout logic
        return Response({'error': 'Use the /checkout endpoint to create an order.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Here you will implement the logic for M-Pesa or Stripe
        payment_method = serializer.validated_data['payment_method']
        
        if payment_method == 'Mpesa':
            # This is where we'll handle the STK Push
            return Response({'message': 'M-Pesa checkout initiated'}, status=status.HTTP_200_OK)
        elif payment_method == 'Stripe':
            # This is where we'll handle the PaymentIntent
            return Response({'message': 'Stripe checkout initiated'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid payment method'}, status=status.HTTP_400_BAD_REQUEST)