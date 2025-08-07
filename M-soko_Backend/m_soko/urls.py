from baton.autodiscover import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Import all of your views here
from products.views import ProductViewSet, CategoryViewSet, ReviewViewSet
from users.views import UserRegistrationView, UserProfileView, AddressViewSet
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
    path('baton/', include('baton.urls')),

    # Main API endpoint for all router views
    path('api/', include(router.urls)),

    # Add other non-router views here
    path('api/register/', UserRegistrationView.as_view(), name='register'),
    path('api/profile/', UserProfileView.as_view(), name='user-profile'),
    path('api/checkout/', CheckoutView.as_view(), name='checkout'),
    path('api/orders/history/', OrderHistoryView.as_view(), name='order-history'),
    
    # Nested URLs for Product Reviews
    path('api/products/<int:product_pk>/reviews/', 
         ReviewViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='product-reviews-list'),
    path('api/products/<int:product_pk>/reviews/<int:pk>/', 
         ReviewViewSet.as_view({'get': 'retrieve'}), 
         name='product-reviews-detail'),
]