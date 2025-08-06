from django.contrib import admin
from .models import Category, Product, Review

admin.site.register(Category)
admin.site.register(Product)

# A more advanced registration for the Review model
@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    # This controls which fields are displayed in the list view
    list_display = ('user', 'product', 'rating', 'created_at')
    
    # This adds a filter sidebar to the right
    list_filter = ('rating', 'created_at')
    
    # This allows you to search reviews by comment or user
    search_fields = ('comment', 'user__username')