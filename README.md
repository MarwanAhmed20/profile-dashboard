# AI-Capsule Profile Dashboard

Complete student management system with visual analytics and progress tracking.

## 🚀 Quick Start

### Development Setup
```bash
# 1. Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py setup_ml_domains
python manage.py runserver

# 2. Frontend (new terminal)
cd ai-capsule-dashboard
npm install
npm run dev
```

### Create Admin Account
```bash
cd backend
python manage.py shell
```
```python
from apps.users.models import User
admin = User.objects.create_superuser(
    email='admin@aicapsule.com',
    username='admin@aicapsule.com',
    password='Admin123!',
    first_name='Admin',
    last_name='User'
)
admin.role = 'admin'
admin.admin_code = 'ADMIN2024'
admin.save()
exit()
```

### Access
- Frontend: http://127.0.0.1:5173
- Backend: http://127.0.0.1:8000
- Admin Panel: http://127.0.0.1:8000/admin

## 📖 Full Documentation

See [Backend README](./backend/README.md) for complete documentation including:
- Installation guide
- Production deployment
- Vercel deployment
- API documentation

## 🛠️ Tech Stack

- **Backend:** Django REST Framework, PostgreSQL
- **Frontend:** React, Vite, TailwindCSS, Recharts
- **Auth:** JWT
- **Deployment:** Docker, Vercel, Railway

## 📂 Project Structure
