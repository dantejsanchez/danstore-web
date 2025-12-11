from django.contrib import admin
from .models import Category, Product, ProductImage

# 1. Configuración de Imágenes Extra (Inline)
class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    # --- LISTADO PRINCIPAL (CORREGIDO) ---
    # REGLA DE ORO: Todo lo que esté en 'list_editable' DEBE estar en 'list_display'
    list_display = ('name', 'price', 'original_price', 'category', 'label', 'is_active')
    
    # Edición rápida sin entrar al producto
    list_editable = ('price', 'label', 'is_active')
    
    # Filtros laterales
    list_filter = ('category', 'label', 'is_active', 'brand')
    
    # Barra de búsqueda
    search_fields = ('name', 'brand')
    
    # Imágenes extra dentro del producto
    inlines = [ProductImageInline]

    # --- ORGANIZACIÓN DEL FORMULARIO (Fieldsets) ---
    fieldsets = (
        ('Información Principal', {
            'fields': ('name', 'category', 'brand', 'description', 'image')
        }),
        ('Precios', {
            'fields': ('price', 'original_price'),
            'description': 'Si pones un precio original mayor al actual, se calculará el descuento.'
        }),
        ('Marketing y Visibilidad', {
            'fields': ('label', 'is_active', 'is_black_friday'), 
            'classes': ('collapse',), 
        }),
    )