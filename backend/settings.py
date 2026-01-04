"""
Django settings for backend project - VERSIÓN ORACLE CLOUD
"""
import os
import dj_database_url
from pathlib import Path
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# ==========================================
# 1. CONFIGURACIÓN DE SEGURIDAD
# ==========================================

# ADVERTENCIA: En el futuro, esta clave no debe estar escrita aquí directamente.
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-8)3nl3)x!+54nu+*b7@ba^k5j-6%d-_ek@*@+ao3dz^1gd@_eu')

# IMPORTANTE: En producción (Oracle) esto debe ser False.
# Si tienes un error 500 y no sabes qué es, cámbialo a True momentáneamente para ver el error.
DEBUG = True

# Aquí permite tu IP de Oracle y localhost.
# El '*' permite todo, úsalo solo si tienes problemas de conexión al inicio.
ALLOWED_HOSTS = ['*']

CSRF_TRUSTED_ORIGINS = [
    'http://129.151.109.180',      # Tu IP de Oracle (REEMPLAZAR SI CAMBIÓ)
    'https://129.151.109.180',
    'http://localhost:5173',
    'http://127.0.0.1:8000',
]

# Configuración para que Nginx maneje HTTPS y Django se entere
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Como aún no tenemos HTTPS activo (el candadito), dejamos esto en False
CSRF_COOKIE_SECURE = False
SESSION_COOKIE_SECURE = False


# ==========================================
# 2. APLICACIONES Y MIDDLEWARE
# ==========================================

INSTALLED_APPS = [
    'cloudinary_storage',
    'cloudinary',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'store',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', # Vital para estáticos en Oracle
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'


# ==========================================
# 3. BASE DE DATOS
# ==========================================

# Usaremos SQLite por defecto para evitar errores de instalación ahora.
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# ==========================================
# 4. PASSWORD & IDIOMA
# ==========================================

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# ==========================================
# 5. ARCHIVOS ESTÁTICOS (Vital para que se vea bien la web)
# ==========================================

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Whitenoise se encarga de servir los archivos en producción
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# ==========================================
# 6. CORS (Permisos de acceso desde React)
# ==========================================

CORS_ALLOW_ALL_ORIGINS = True # Permisivo para evitar errores al inicio


# ==========================================
# 7. MULTIMEDIA (CLOUDINARY)
# ==========================================

DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

CLOUDINARY_STORAGE = {
    'CLOUD_NAME': 'dk64vjoit',
    'API_KEY': '694754861946913',
    'API_SECRET': 'oajkHZ8FePPz3o_E5ve2wUvIBB8',
}

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')


# ==========================================
# 8. REST FRAMEWORK & JWT
# ==========================================

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
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}