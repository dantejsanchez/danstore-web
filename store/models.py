from django.db import models

# --- MODELO CATEGORÍA (Lo mantenemos porque Product lo necesita) ---
class Category(models.Model):
    name = models.CharField(max_length=255, verbose_name="Nombre")
    slug = models.SlugField(unique=True, blank=True, null=True)

    class Meta:
        verbose_name_plural = "Categorías"

    def __str__(self):
        return self.name

# --- MODELO PRODUCTO (CORREGIDO Y COMPLETO) ---
class Product(models.Model):
    # 1. CAMPOS BÁSICOS (Los que faltaban y daban error)
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE, verbose_name="Categoría")
    name = models.CharField(max_length=255, verbose_name="Nombre del Producto")
    brand = models.CharField(max_length=255, blank=True, null=True, verbose_name="Marca")
    description = models.TextField(blank=True, null=True, verbose_name="Descripción")
    
    # 2. PRECIOS E IMAGEN
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio Actual")
    original_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, verbose_name="Precio Original (Antes)")
    image = models.ImageField(upload_to='products/', blank=True, null=True, verbose_name="Imagen Principal")
    
    # 3. ESTADO
    is_active = models.BooleanField(default=True, verbose_name="¿Activo?")
    is_black_friday = models.BooleanField(default=False, verbose_name="¿Es Black Friday? (Check simple)")

    # 4. NUEVO CAMPO: ETIQUETA ESPECIAL (La funcionalidad que pediste)
    LABEL_CHOICES = (
        ('BF', 'Black Friday (Etiqueta Negra)'),
        ('OF', 'Oferta (Etiqueta Roja)'),
        ('LQ', 'Liquidación (Etiqueta Naranja)'),
        ('NW', 'Nuevo (Etiqueta Azul)'),
        ('NONE', 'Sin Etiqueta'),
    )
    label = models.CharField(
        max_length=4, 
        choices=LABEL_CHOICES, 
        default='NONE',
        verbose_name="Etiqueta Visual"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Producto"
        verbose_name_plural = "Productos"

    def __str__(self):
        return self.name

# --- OTROS MODELOS (Si tenías ProductImage, déjalo aquí) ---
class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/gallery/')

    def __str__(self):
        return f"Imagen de {self.product.name}"