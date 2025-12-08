from django.contrib import admin
from .models import Product, Category, ProductImage # <-- 1. IMPORTAR ProductImage

# 1. Crear el Inline: Permite adjuntar múltiples imágenes directamente en el formulario de Producto
class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1 # Muestra 1 campo de subida extra por defecto

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    # 2. Conectar el formulario de Producto con el Inline de imágenes
    inlines = [ProductImageInline] 

    # Mantener tus configuraciones existentes
    list_display = ('name', 'price', 'category', 'is_active')
    list_editable = ('price', 'is_active')
    list_filter = ('category',)