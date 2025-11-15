# Capsule Dashboard Backend

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Database Setup
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### 4. Create Initial Domains
```bash
python manage.py shell
```
```python
from apps.students.models import Domain
domains = [
    {'name': 'Mathematics', 'order': 1},
    {'name': 'Science', 'order': 2},
    {'name': 'Reading', 'order': 3},
    {'name': 'Writing', 'order': 4},
]
for d in domains:
    Domain.objects.create(**d)
```

### 5. Run Server
```bash
python manage.py runserver
```

## Production Deployment

### Using Docker
```bash
docker-compose up -d
```

### Manual Deployment
1. Set DEBUG=False in .env
2. Configure PostgreSQL database
3. Run: `python manage.py collectstatic`
4. Use gunicorn: `gunicorn config.wsgi:application --bind 0.0.0.0:8000`
