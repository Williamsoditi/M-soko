from rest_framework import viewsets, mixins, status, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend # 👈 New: Import for filtering

from .models import Product, Category, Review
from .serializers import ProductSerializer, CategorySerializer, ReviewSerializer
from .filters import ProductFilter

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('id')
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    # 👈 New: Add the filter_backends to enable both search and filtering
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description']

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class ReviewViewSet(viewsets.ModelViewSet):
    # 👈 New: Add a base queryset here. It's required for ModelViewSet.
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    
    # 👈 New: Use a more idiomatic way to handle permissions based on action
    def get_permissions(self):
        # Admins can update or delete reviews
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        # Authenticated users can create reviews, all can view
        return [IsAuthenticatedOrReadOnly()]

    def get_queryset(self):
        product_pk = self.kwargs['product_pk']
        # Admins can see all reviews for a product
        if self.request.user and self.request.user.is_staff:
            return self.queryset.filter(product=product_pk).order_by('-created_at')
        
        # Public users can only see approved and visible reviews
        return self.queryset.filter(
            product=product_pk,
            status='approved',
            is_visible=True
        ).order_by('-created_at')

    def perform_create(self, serializer):
        product = Product.objects.get(pk=self.kwargs['product_pk'])
        # Set initial status to 'pending'
        serializer.save(user=self.request.user, product=product, status='pending', is_visible=False)

