from rest_framework import viewsets, mixins, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAdminUser # <-- Added IsAdminUser
from .models import Product, Category, Review
from .serializers import ProductSerializer, CategorySerializer, ReviewSerializer
from .filters import ProductFilter

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('id')
    filterset_class = ProductFilter
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    search_fields = ['name', 'description']

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ReviewViewSet(viewsets.ModelViewSet): # <-- Changed to ModelViewSet
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # Admins can see all reviews for a product
        if self.request.user and self.request.user.is_staff:
            return Review.objects.filter(product=self.kwargs['product_pk']).order_by('-created_at')
        
        # Public users can only see approved and visible reviews
        return Review.objects.filter(
            product=self.kwargs['product_pk'],
            status='approved',
            is_visible=True
        ).order_by('-created_at')

    def perform_create(self, serializer):
        product = Product.objects.get(pk=self.kwargs['product_pk'])
        # Set initial status to 'pending'
        serializer.save(user=self.request.user, product=product, status='pending', is_visible=False)

    def update(self, request, *args, **kwargs):
        # Admins can update a review
        if not request.user.is_staff:
            return Response({"detail": "You do not have permission to perform this action."}, status=status.HTTP_403_FORBIDDEN)
        
        # The update will be handled by the default update method
        return super().update(request, *args, **kwargs)