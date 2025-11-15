#!/bin/bash

echo "Starting database setup..."

# Method 1: Fresh database (using environment variable for password)
export PGPASSWORD='22329119'

dropdb capsule_db --if-exists -h localhost -U postgres
createdb capsule_db -h localhost -U postgres

unset PGPASSWORD

# Remove old migrations (keep __init__.py files)
find apps/users/migrations -type f -name "0*.py" -delete
find apps/students/migrations -type f -name "0*.py" -delete
find apps/assessments/migrations -type f -name "0*.py" -delete

# Create __init__.py if they don't exist
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
echo "✅ Setup complete!"
echo ""
echo "To start the server, run:"
echo "  python manage.py runserver"
echo ""
echo "Login credentials:"
echo "  Admin: username=admin, password=admin123"
echo "  Student: username=john_doe, password=student123"
