from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Categories"

# --- CLASE PRINCIPAL DE PRODUCTO ---
class Product(models.Model):
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    brand = models.CharField(max_length=100, default="Genérico")
    description = models.TextField(blank=True)
    
    price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    image = models.ImageField(upload_to='products/covers/')
    digital_file = models.FileField(upload_to='products/files/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

# --- CLASE SECUNDARIA DE IMÁGENES (MOVEMOS ESTO FUERA) ---
class ProductImage(models.Model):
    product = models.ForeignKey(
        'Product', 
        related_name='images', 
        on_delete=models.CASCADE,
        verbose_name="Producto"
    )
    image = models.ImageField(
        upload_to='products/gallery/', 
        verbose_name="Imagen de Galería"
    )
    is_variant_swatch = models.BooleanField(
        default=False, 
        verbose_name="¿Es un Swatch (Opción de color/variante)?"
    )
    order = models.IntegerField(default=0, verbose_name="Orden")

    def __str__(self):
        return f"Imagen de {self.product.name} (Orden: {self.order})"