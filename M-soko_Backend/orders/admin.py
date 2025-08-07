# orders/admin.py

from django.contrib import admin
from .models import Order, OrderItem, Cart, CartItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    raw_id_fields = ['product']
    readonly_fields = ['price']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('user', 'status', 'total_amount', 'created_at')
    list_filter = ('status', 'created_at')
    inlines = [OrderItemInline]
    readonly_fields = ['total_amount']

    def save_formset(self, request, form, formset, change):
        instances = formset.save(commit=False)
        order_instance = form.instance
        
        # Manually set the price from the product before saving
        for instance in instances:
            if not instance.price:
                instance.price = instance.product.price
            instance.save()
        
        # Calculate and save the total amount for the order
        total_amount = sum(item.price * item.quantity for item in order_instance.items.all())
        order_instance.total_amount = total_amount
        order_instance.save()
        
        # Save the formset
        formset.save_m2m()

class CartItemInline(admin.TabularInline):
    model = CartItem
    raw_id_fields = ['product']

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at')
    inlines = [CartItemInline]