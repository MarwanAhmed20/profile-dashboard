#!/bin/bash

echo "Creating migrations for new student fields..."
python manage.py makemigrations

echo "Applying migrations..."
python manage.py migrate

echo "✅ Migration complete!"
