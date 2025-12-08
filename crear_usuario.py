import os
import django

# Configurar Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Si no existe el usuario 'admin', lo creamos
if not User.objects.filter(username='admin').exists():
    print("Creando superusuario automático...")
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print("¡Superusuario 'admin' creado con contraseña 'admin123'!")
else:
    print("El usuario 'admin' ya existe.")