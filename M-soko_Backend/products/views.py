from rest_framework import viewsets, mixins
from rest_framework.permissions import IsAuthenticatedOrReadOnly
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

class ReviewViewSet(mixins.CreateModelMixin,
                    mixins.ListModelMixin,
                    mixins.RetrieveModelMixin,
                    viewsets.GenericViewSet):
    """
    A ViewSet for viewing and creating product reviews.
    """
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # Only return reviews for a specific product
        product_id = self.kwargs.get('product_pk')
        if product_id:
            return self.queryset.filter(product_id=product_id)
        return self.queryset

    def perform_create(self, serializer):
        # Automatically set the user and product for the review
        product_id = self.kwargs.get('product_pk')
        product = Product.objects.get(id=product_id)
        serializer.save(user=self.request.user, product=product)