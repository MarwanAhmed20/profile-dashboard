# AI-Capsule Profile Dashboard


## 🛠️ Tech Stack

**Backend:**
- Django 5.1+
- Django REST Framework
- PostgreSQL / SQLite
- JWT Authentication

**Frontend:**
- React 18
- Vite
- TailwindCSS
- Recharts
- Lucide Icons

## 📦 Installation

### Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL (optional, SQLite works for development)

### 1. Clone Repository
```bash
git clone <repository-url>
cd profile-dashboard
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (optional)
cp .env.example .env
# Edit .env with your settings if needed
```

### 3. Database Setup

```bash
# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create initial domains (ML/AI domains)
python manage.py setup_ml_domains
```

### 4. Frontend Setup

```bash
cd ../ai-capsule-dashboard

# Install dependencies
npm install

# Create .env file (optional)
cp .env.example .env
# Default API URL is http://127.0.0.1:8000/api
```

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python manage.py runserver
```
Backend runs on: `http://127.0.0.1:8000`

**Terminal 2 - Frontend:**
```bash
cd ai-capsule-dashboard
npm run dev
```
Frontend runs on: `http://127.0.0.1:5173`

### Access Points
- **Frontend:** http://127.0.0.1:5173
- **Backend API:** http://127.0.0.1:8000/api
- **Django Admin:** http://127.0.0.1:8000/admin

## 👤 Creating Admin Account

### Method 1: Django Shell (Recommended)
```bash
cd backend
python manage.py shell
```

Then in the Python shell:
```python
from apps.users.models import User

# Create admin user
admin = User.objects.create_superuser(
    email='admin@aicapsule.com',
    username='admin@aicapsule.com',
    first_name='Admin',
    last_name='User',
    password='YourSecurePassword123!'
)

# Set role and admin code
admin.role = 'admin'
admin.admin_code = 'ADMIN2024'  # 6-20 characters
admin.save()

print(f"✅ Admin created!")
print(f"Email: {admin.email}")
print(f"Admin Code: {admin.admin_code}")

exit()
```

### Method 2: Django Admin Panel
```bash
python manage.py createsuperuser
# Follow prompts, then set admin_code via Django admin
```

1. Go to http://127.0.0.1:8000/admin
2. Login with superuser credentials
3. Navigate to Users → Select your user
4. Set "Role" to "admin"
5. Set "Admin code" (e.g., ADMIN2024)
6. Save

### Method 3: From Frontend Dashboard
After logging in as admin:
1. Click "🔑 Admin Code" button
2. Create your unique admin code
3. Share this code with students for registration

## 🌐 Production Deployment

### Using Docker

**1. Create docker-compose.yml:**
```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: aicapsule
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your_secure_password
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    command: gunicorn config.wsgi:application --bind 0.0.0.0:8000
    volumes:
      - ./backend:/app
      - static_volume:/app/static
      - media_volume:/app/media
    ports:
      - "8000:8000"
    environment:
      - DEBUG=False
      - DATABASE_URL=postgresql://postgres:your_secure_password@db:5432/aicapsule
      - SECRET_KEY=your-super-secret-key-change-this
      - ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com
    depends_on:
      - db

  frontend:
    build: ./ai-capsule-dashboard
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  postgres_data:
  static_volume:
  media_volume:
```

**2. Create Backend Dockerfile:**
```dockerfile
# filepath: backend/Dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]
```

**3. Create Frontend Dockerfile:**
```dockerfile
# filepath: ai-capsule-dashboard/Dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**4. Run with Docker:**
```bash
# Build and start all services
docker-compose up -d --build

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Production Setup

**Backend:**
```bash
cd backend

# Install production dependencies
pip install gunicorn psycopg2-binary

# Set environment variables
export DEBUG=False
export SECRET_KEY='your-super-secret-key'
export DATABASE_URL='postgresql://user:password@localhost/dbname'
export ALLOWED_HOSTS='yourdomain.com,www.yourdomain.com'

# Collect static files
python manage.py collectstatic --noinput

# Run with gunicorn
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

**Frontend:**
```bash
cd ai-capsule-dashboard

# Build for production
npm run build

# Serve with nginx or any static file server
# dist/ folder contains production build
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        root /path/to/ai-capsule-dashboard/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /admin {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## ☁️ Vercel Deployment

### Frontend Deployment on Vercel

**1. Install Vercel CLI:**
```bash
npm install -g vercel
```

**2. Deploy Frontend:**
```bash
cd ai-capsule-dashboard

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your username/organization
# - Link to existing project? No
# - Project name: ai-capsule-dashboard
# - Directory: ./
# - Override settings? No

# Production deployment
vercel --prod
```

**3. Configure Environment Variables on Vercel:**
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Add: `VITE_API_URL` = `https://your-backend-url.com/api`

### Backend Deployment Options

**Option 1: Railway.app (Recommended for Backend)**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
cd backend
railway init

# Deploy
railway up

# Set environment variables in Railway dashboard
```

**Option 2: Render.com**
1. Connect GitHub repository
2. Create new Web Service
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `gunicorn config.wsgi:application`
5. Add environment variables

**Option 3: Heroku**
```bash
# Install Heroku CLI
heroku login

cd backend

# Create Heroku app
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set DEBUG=False
heroku config:set SECRET_KEY='your-secret-key'

# Deploy
git push heroku main

# Run migrations
heroku run python manage.py migrate
heroku run python manage.py setup_ml_domains
```

### vercel.json Configuration
```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## 📝 Environment Variables

### Backend (.env)
```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://127.0.0.1:8000/api
```

## 🧪 Testing

**Backend Tests:**
```bash
cd backend
python manage.py test
```

**Frontend Tests:**
```bash
cd ai-capsule-dashboard
npm run test
```

## 📚 API Documentation

Access API documentation at: `http://127.0.0.1:8000/api/`

Key endpoints:
- `POST /api/auth/register/` - Student registration
- `POST /api/auth/login/` - User login
- `GET /api/students/` - List students (admin)
- `GET /api/students/me/` - Current student profile
- `GET /api/courses/` - List courses
- `GET /api/students/{id}/weekly-progress/` - Weekly progress data

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@aicapsule.com

---

**Made with ❤️ by AI-Capsule Team**
