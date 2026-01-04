"""
Django settings for backend project - VERSIÓN PRODUCCIÓN CLOUDINARY
"""
import os
from pathlib import Path
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# ==========================================
# 1. CONFIGURACIÓN DE SEGURIDAD
# ==========================================
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-8)3nl3)x!+54nu+*b7@ba^k5j-6%d-_ek@*@+ao3dz^1gd@_eu')
DEBUG = True # Cambiar a False cuando todo esté verificado
ALLOWED_HOSTS = ['*']

CSRF_TRUSTED_ORIGINS = [
    'http://129.151.109.180',
    'https://129.151.109.180',
    'http://localhost:5173',
    'http://127.0.0.1:8000',
]

# ==========================================
# 2. APLICACIONES Y MIDDLEWARE
# ==========================================
INSTALLED_APPS = [
    'cloudinary_storage', # Debe ir antes de staticfiles
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'cloudinary', # App de Cloudinary
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'store',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'
WSGI_APPLICATION = 'backend.wsgi.application'

# ==========================================
# 3. BASE DE DATOS
# ==========================================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# ==========================================
# 4. ARCHIVOS ESTÁTICOS Y MULTIMEDIA (CLOUDINARY)
# ==========================================
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Configuración Maestra de Cloudinary
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': 'dk64vjoit',
    'API_KEY': '694754861946913',
    'API_SECRET': 'oajkHZ8FePPz3o_E5ve2wUvIBB8',
}

# Forzamos a que los archivos subidos (MEDIA) usen Cloudinary
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

# Mantenemos WhiteNoise para los archivos estáticos (CSS, JS del admin)
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Eliminamos la dependencia de MEDIA_ROOT local para evitar confusión del servidor
MEDIA_URL = '/media/' 

# ==========================================
# 5. REST FRAMEWORK & CORS
# ==========================================
CORS_ALLOW_ALL_ORIGINS = True

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# Configuración básica restante
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'