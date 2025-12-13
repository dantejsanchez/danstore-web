#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

# ESTA ES LA LÍNEA MÁGICA:
# Crea la carpeta staticfiles y mete ahí todo el CSS/JS para que WhiteNoise lo encuentre
python manage.py collectstatic --noinput

python manage.py migrate