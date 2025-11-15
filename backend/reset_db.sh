#!/bin/bash

# Drop and recreate the database
psql -U postgres -c "DROP DATABASE IF EXISTS capsule_db;"
psql -U postgres -c "CREATE DATABASE capsule_db;"

# Remove migration files (keep __init__.py)
find apps/*/migrations -type f -name "*.py" ! -name "__init__.py" -delete
find apps/*/migrations -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null

# Create and apply migrations
python manage.py makemigrations users
python manage.py makemigrations students
python manage.py makemigrations assessments
python manage.py migrate

echo "Database reset complete!"
