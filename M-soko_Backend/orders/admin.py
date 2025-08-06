# orders/admin.py
from django.contrib import admin
from .models import Order, OrderItem, Payment, Cart, CartItem

# 1. Define Inlines
# An Inline lets you edit related objects on the same page as the parent object.
# This makes it easy to see all OrderItems when viewing an Order.
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    raw_id_fields = ['product'] # Use a text input for foreign keys, better for large number of products
    readonly_fields = ['price']
    extra = 0 # No extra blank forms by default, add new ones with a button

# An Inline for the Payment model, so we can see payment details on the Order page
class PaymentInline(admin.StackedInline):
    model = Payment
    readonly_fields = ['transaction_id', 'amount', 'status', 'created_at']
    can_delete = False
    max_num = 1 # An order should only have one payment record

# 2. Define Custom Admin Classes
# This is where we add all our customizations.
# @admin.register is a modern alternative to admin.site.register()
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    # This tuple controls which columns are shown in the list of orders
    list_display = ['id', 'user', 'status', 'total_amount', 'created_at']
    # Adds a sidebar to filter orders by these fields
    list_filter = ['status', 'created_at']
    # Adds a search bar to find orders
    search_fields = ['user__username', 'id']
    # Includes the inlines defined above on the Order detail page
    inlines = [OrderItemInline, PaymentInline]
    # Prevents these fields from being edited, as they're set programmatically
    readonly_fields = ['user', 'total_amount', 'created_at']

    # We can also add custom methods to optimize or display custom data
    def get_queryset(self, request):
        # Prefetch related models to optimize queries and avoid performance issues
        return super().get_queryset(request).select_related('user').prefetch_related('items', 'payment')

# 3. Registering the other models with customizations
@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'product', 'quantity', 'price']
    list_filter = ['order__status']

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'payment_method', 'status', 'amount', 'transaction_id']
    list_filter = ['payment_method', 'status']
    search_fields = ['transaction_id', 'order__id', 'order__user__username']