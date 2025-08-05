from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CartViewSet, CartItemViewSet, OrderViewSet, CheckoutView

router = DefaultRouter()
router.register(r'carts', CartViewSet, basename='cart')
router.register(r'cart-items', CartItemViewSet, basename='cart-item')
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
    path('checkout/', CheckoutView.as_view(), name='checkout'),
]