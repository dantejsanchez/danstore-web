from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from store import views

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API TIENDA
    path('api/products/', views.get_products, name='get_products'),
    path('api/products/<int:pk>/', views.get_product, name='get_product'),
    path('api/categories/', views.get_categories, name='get_categories'),
    path('api/brands/', views.get_unique_brands, name='get_unique_brands'),
    path('api/recommendations/<int:pk>/', views.get_related_products, name='get_related_products'),
    path('api/create_preference/', views.create_preference, name='create_preference'),

    # API AUTH
    path('api/login/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/register/', views.register_user, name='register'),
]

# 🔴 CORRECCIÓN: Patrón estándar para servir archivos en DESARROLLO
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)