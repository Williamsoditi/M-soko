# products/urls.py
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, CategoryViewSet

router = DefaultRouter()
# This registers the products list at /api/products/
router.register(r'', ProductViewSet)
# This registers the categories list at /api/products/categories/
router.register(r'categories', CategoryViewSet)

urlpatterns = router.urls