from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserRegistrationView, UserLoginView, UserViewSet, UserProfileView

# Create a router and register the UserViewSet
router = DefaultRouter()
router.register(r'', UserViewSet, basename='user') # An empty string for the URL prefix will make it list at /api/users/

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    # Use the router URLs
    path('', include(router.urls)),
]