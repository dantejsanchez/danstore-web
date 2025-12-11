from django.db import models

# --- MODELO CATEGORÍA ---
class Category(models.Model):
    name = models.CharField(max_length=255, verbose_name="Nombre")
    slug = models.SlugField(unique=True, blank=True, null=True)

    class Meta:
        verbose_name_plural = "Categorías"

    def __str__(self):
        return self.name

# --- MODELO PRODUCTO (PROFESIONAL Y LIMPIO) ---
class Product(models.Model):
    # 1. Etiquetas de Marketing (TEXTO PURO, SIN EMOJIS)
    class Label(models.TextChoices):
        NONE = 'NONE', 'Sin etiqueta'
        BLACK_FRIDAY = 'BF', 'Black Friday'
        OFFER = 'OF', 'Oferta'
        LIQUIDATION = 'LQ', 'Liquidación'
        NEW = 'NW', 'Nuevo'

    # 2. Campos Básicos
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE, verbose_name="Categoría")
    name = models.CharField(max_length=255, verbose_name="Nombre del Producto")
    brand = models.CharField(max_length=255, blank=True, null=True, verbose_name="Marca")
    description = models.TextField(blank=True, null=True, verbose_name="Descripción")
    
    # 3. Precios e Imagen
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio Actual")
    original_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, verbose_name="Precio Original (Antes)")
    image = models.ImageField(upload_to='products/', blank=True, null=True, verbose_name="Imagen Principal")
    
    # 4. Estado y Marketing
    is_active = models.BooleanField(default=True, verbose_name="¿Visible en Tienda?")
    
    # Campo Legacy (Mantenido para evitar errores, pero no se usa visualmente)
    is_black_friday = models.BooleanField(default=False, verbose_name="¿Es Black Friday? (Check)")

    # Campo de Etiqueta Profesional
    label = models.CharField(
        max_length=4, 
        choices=Label.choices, 
        default=Label.NONE,
        verbose_name="Etiqueta de Marketing"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Producto"
        verbose_name_plural = "Productos"

    def __str__(self):
        return self.name

# --- MODELO IMÁGENES EXTRA ---
class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/gallery/')

    def __str__(self):
        return f"Imagen de {self.product.name}"