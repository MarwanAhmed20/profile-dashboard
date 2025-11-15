#!/bin/bash

echo "Starting database setup..."
echo "You may be prompted for PostgreSQL password (22329119)"
echo ""

# Fresh database
dropdb capsule_db --if-exists -h localhost -U postgres
createdb capsule_db -h localhost -U postgres

# Remove old migrations (keep __init__.py files)
find apps/*/migrations -type f -name "0*.py" -delete 2>/dev/null
touch apps/users/migrations/__init__.py
touch apps/students/migrations/__init__.py
touch apps/assessments/migrations/__init__.py

# Create migrations
echo "Creating migrations..."
python manage.py makemigrations users
python manage.py makemigrations students  
python manage.py makemigrations assessments

# Apply migrations
echo "Applying migrations..."
python manage.py migrate

# Setup initial data
echo "Setting up initial data..."
python setup_initial_data.py

echo ""
echo "✅ Setup complete! Run: python manage.py runserver"
