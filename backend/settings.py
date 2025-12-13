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

# Si 'RENDER' está en las variables de entorno, estamos en producción.
DEBUG = 'RENDER' not in os.environ

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
# 5. ARCHIVOS ESTÁTICOS (CORREGIDO)
# ==========================================

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Lógica corregida: Definimos el almacenamiento SIEMPRE
if not DEBUG:
    # Producción (Render): Usamos WhiteNoise con compresión
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
else:
    # Desarrollo (DEBUG=True): Usamos el estándar de Django
    STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'

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

# Configuración estricta: Falla si las variables de entorno no están.
CLOUDINARY_STORAGE = {}
if not DEBUG:
    try:
        CLOUDINARY_STORAGE['CLOUD_NAME'] = os.environ['CLOUDINARY_CLOUD_NAME']
        CLOUDINARY_STORAGE['API_KEY'] = os.environ['CLOUDINARY_API_KEY']
        CLOUDINARY_STORAGE['API_SECRET'] = os.environ['CLOUDINARY_API_SECRET']
    except KeyError as e:
        raise KeyError(f"Variable de entorno para Cloudinary no encontrada: {e}. La aplicación no puede iniciar.") from e
else:
    # Para desarrollo local, es opcional y no detiene la app.
    CLOUDINARY_STORAGE['CLOUD_NAME'] = os.environ.get('CLOUDINARY_CLOUD_NAME')
    CLOUDINARY_STORAGE['API_KEY'] = os.environ.get('CLOUDINARY_API_KEY')
    CLOUDINARY_STORAGE['API_SECRET'] = os.environ.get('CLOUDINARY_API_SECRET')


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

# --- DIAGNOSTIC LOGGING ---
# The following lines will print diagnostic information to your Render logs
# during application startup. This will help debug the configuration.
print("\n" + "="*50)
print("DIAGNOSTIC INFO - START")
print("="*50)
print(f"[SETTINGS] DEBUG = {DEBUG}")
print(f"[STORAGE] DEFAULT_FILE_STORAGE = {DEFAULT_FILE_STORAGE}")
print(f"[STORAGE] STATICFILES_STORAGE = {STATICFILES_STORAGE}")
print(f"[PATHS] STATIC_ROOT = {STATIC_ROOT}")
print(f"[PATHS] MEDIA_ROOT = {MEDIA_ROOT}")

# Check Cloudinary settings as seen by Django
try:
    cloud_name = CLOUDINARY_STORAGE.get('CLOUD_NAME', 'NOT FOUND')
    api_key_found = 'YES' if CLOUDINARY_STORAGE.get('API_KEY') else 'NO'
    api_secret_found = 'YES' if CLOUDINARY_STORAGE.get('API_SECRET') else 'NO'
    print(f"[CLOUDINARY] CLOUD_NAME = {cloud_name}")
    print(f"[CLOUDINARY] API_KEY Found? = {api_key_found}")
    print(f"[CLOUDINARY] API_SECRET Found? = {api_secret_found}")
except NameError:
    print("[CLOUDINARY] 'CLOUDINARY_STORAGE' dictionary not found.")

print("="*50)
print("DIAGNOSTIC INFO - END")
print("="*50 + "\n")
