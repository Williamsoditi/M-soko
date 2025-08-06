from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets, generics
from .models import Cart, CartItem, Order, OrderItem, Payment
from products.models import Product
from .serializers import CartSerializer, OrderSerializer
from users.models import Address

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
        shipping_address_id = request.data.get('shipping_address')

        if not shipping_address_id:
            return Response({'error': 'A shipping address is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                shipping_address = Address.objects.get(id=shipping_address_id, user=request.user)
                cart = Cart.objects.get(user=request.user)
                cart_items = cart.items.all()

                if not cart_items:
                    return Response({'error': 'Your cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

                # --- NEW INVENTORY LOGIC ---
                # Check for sufficient stock before creating the order
                for item in cart_items:
                    product = item.product
                    if product.stock < item.quantity:
                        return Response(
                            {'error': f'Insufficient stock for product: {product.name}. Available: {product.stock}'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                
                total_amount = sum(item.product.price * item.quantity for item in cart_items)
                
                order = Order.objects.create(
                    user=request.user,
                    shipping_address=shipping_address,
                    total_amount=total_amount,
                    status='Pending'
                )
                
                # Create OrderItem instances and decrement stock
                for item in cart_items:
                    product = item.product
                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        quantity=item.quantity,
                        price=product.price
                    )
                    # Decrement the stock
                    product.stock -= item.quantity
                    product.save()

                # Clear the user's cart
                cart_items.delete()

            serializer = OrderSerializer(order)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Address.DoesNotExist:
            return Response({'error': 'Shipping address not found or does not belong to you.'}, status=status.HTTP_404_NOT_FOUND)
        except Cart.DoesNotExist:
            return Response({'error': 'Your cart could not be found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f'An unexpected error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        
class OrderHistoryView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        This view should return a list of all orders for the currently authenticated user.
        """
        return Order.objects.filter(user=self.request.user).order_by('-created_at')