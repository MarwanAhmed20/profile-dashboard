#!/bin/bash

echo "Creating migrations for new domain models..."
python manage.py makemigrations

echo "Applying migrations..."
python manage.py migrate

echo "Setting up ML/AI domains..."
python manage.py setup_ml_domains

echo "✅ Domain migration complete!"
