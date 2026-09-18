from django.contrib import admin

from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'status', 'amount', 'currency', 'provider', 'created_at']
    list_filter = ['status', 'provider']
    search_fields = ['session_id', 'payment_intent_id', 'order__id']
    readonly_fields = ['session_id', 'payment_intent_id', 'created_at', 'updated_at']
