"""
Django settings for backend project.
"""
import os
import dj_database_url
from pathlib import Path
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# ==========================================
# 1. CONFIGURACIÓN DE SEGURIDAD (PRODUCCIÓN)
# ==========================================

# Lee la clave secreta de la nube, o usa la local por defecto
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-8)3nl3)x!+54nu+*b7@ba^k5j-6%d-_ek@*@+ao3dz^1gd@_eu')

# Si estamos en RENDER, Debug será False (Seguro). En tu PC será True.
DEBUG = True

ALLOWED_HOSTS = ['*']


# ==========================================
# 2. APLICACIONES Y MIDDLEWARE
# ==========================================

INSTALLED_APPS = [
    'cloudinary_storage',       # <--- OBLIGATORIO: Agrega esto
    'cloudinary',               # <--- OBLIGATORIO: Agrega esto
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Apps de Terceros
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    
    # Mis Apps
    'store',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # Siempre el primero
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', # Vital para imágenes en Render
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
# 3. BASE DE DATOS (HÍBRIDA)
# ==========================================

# En tu PC usa SQLite. En Render usa PostgreSQL automáticamente.
DATABASES = {
    'default': dj_database_url.config(
        default='sqlite:///db.sqlite3',
        conn_max_age=600
    )
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
# 5. ARCHIVOS ESTÁTICOS (WhiteNoise)
# ==========================================

STATIC_URL = '/static/'

# Esto asegura que collectstatic funcione en el build
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

if not DEBUG:
    # Compresión para producción
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# ==========================================
# 6. CORS (CONEXIÓN CON REACT)
# ==========================================

# Permitir todo para evitar errores en el primer despliegue
CORS_ALLOW_ALL_ORIGINS = True


# ==========================================
# 7. MULTIMEDIA (FOTOS)
# ==========================================
# Configuración OBLIGATORIA de Cloudinary (Sin if ni else)
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.environ.get('CLOUDINARY_CLOUD_NAME'),
    'API_KEY': os.environ.get('CLOUDINARY_API_KEY'),
    'API_SECRET': os.environ.get('CLOUDINARY_API_SECRET'),
}

# Estas rutas siguen siendo necesarias para que Django sepa manejarlo
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