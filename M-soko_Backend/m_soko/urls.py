# ecommerce_backend/urls.py

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Import all of your views here
from products.views import ProductViewSet, CategoryViewSet, ReviewViewSet
from users.views import UserViewSet, AddressViewSet
from orders.views import CartViewSet, CartItemViewSet, CheckoutView, OrderHistoryView

# Create a single router for all your apps
router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'users/addresses', AddressViewSet, basename='user-address')
router.register(r'orders/carts', CartViewSet, basename='cart')
router.register(r'orders/cart-items', CartItemViewSet, basename='cart-item')

urlpatterns = [
    path('admin/', admin.site.urls),

    # Main API endpoint for all router views
    path('api/', include(router.urls)),

     # Nested URLs for Product Reviews
    # This URL will be used to list and create reviews for a specific product.
    path('api/products/<int:product_pk>/reviews/', 
         ReviewViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='product-reviews-list'),
    
    # This URL will be used to retrieve a single review.
    path('api/products/<int:product_pk>/reviews/<int:pk>/', 
         ReviewViewSet.as_view({'get': 'retrieve'}), 
         name='product-reviews-detail'),

    # Add other non-router views here
    path('api/checkout/', CheckoutView.as_view(), name='checkout'),
    path('api/orders/history/', OrderHistoryView.as_view(), name='order-history'),
]