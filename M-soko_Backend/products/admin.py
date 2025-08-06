from django.contrib import admin
from .models import Product, Category, Review

class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'stock', 'category', 'created_at')
    list_filter = ('category',)
    search_fields = ('name', 'description')

class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'rating', 'status', 'is_visible', 'created_at')
    list_filter = ('status', 'is_visible')
    actions = ['approve_reviews', 'reject_reviews']

    def approve_reviews(self, request, queryset):
        queryset.update(status='approved', is_visible=True)
        self.message_user(request, f"{queryset.count()} reviews have been approved.")
    approve_reviews.short_description = "Approve selected reviews"

    def reject_reviews(self, request, queryset):
        queryset.update(status='rejected', is_visible=False)
        self.message_user(request, f"{queryset.count()} reviews have been rejected.")
    reject_reviews.short_description = "Reject selected reviews"

admin.site.register(Product, ProductAdmin)
admin.site.register(Category, CategoryAdmin)