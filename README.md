# Friendly Reminder

Course booking and management system built with Next.js 14, Prisma, PostgreSQL, and FSD architecture.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Architecture**: Feature-Sliced Design (FSD)
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js with JWT
- **File Storage**: MEGA integration
- **Email**: SMTP with Nodemailer
- **UI**: TailwindCSS + shadcn/ui components
- **Deployment**: Docker + Docker Compose

## 📁 Project Structure (FSD)

```
src/
├── app/                    # Next.js App Router pages
├── entities/              # Business entities
│   ├── user/
│   ├── course/
│   ├── teacher/
│   ├── booking/
│   └── payment/
├── features/              # Feature implementations
│   ├── auth/
│   ├── booking/
│   ├── schedule/
│   ├── upload/
│   └── manage-course/
├── shared/                # Shared utilities
│   ├── ui/               # UI components
│   ├── lib/              # Utilities
│   ├── api/              # API helpers
│   └── config/           # Configuration
└── widgets/              # Complex UI widgets
```

## 👤 User Roles

| Role | Registration | Permissions |
|------|-------------|-------------|
| Student | ✅ | Course booking |
| Parent | ✅ | Course booking |
| Teacher | ✅ | Create/edit courses |
| Admin | ❌ (auto-assigned via seed) | Full access |

## 🚀 Quick Start

### Development Setup

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd friendly_reminder
npm install
```

2. **Setup environment variables**
```bash
cp .env.example .env.development.local
# Edit .env.development.local with your credentials
```

3. **Setup database**
```bash
# Start PostgreSQL (or use Docker)
docker run --name postgres-dev -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15

# Run migrations and seed
npm run db:migrate
npm run db:seed
```

4. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:3000`

### Production Deployment (Docker)

1. **Setup production environment**
```bash
cp .env.example .env.production
# Edit .env.production with production credentials
```

2. **Deploy with Docker Compose**
```bash
docker compose up --build -d
```

Services:
- **Web App**: `http://localhost:3000`
- **PgAdmin**: `http://localhost:5050`

## 📑 Debug Pages

| Page | Description |
|------|-------------|
| `/auth/login` | Authentication |
| `/auth/register` | Registration with role selection |
| `/auth/forgot-password` | Password recovery |
| `/reset-password` | New password input |
| `/profile` | Basic profile |
| `/schedule` | JSON schedule representation |
| `/courses` | Courses table |
| `/admin/courses/create` | Debug course creation form |
| `/upload-test` | MEGA upload test page |

## 🔑 Default Credentials

```
Admin: admin@friendly-reminder.com / admin123
Teacher: teacher@friendly-reminder.com / teacher123
Student: student@friendly-reminder.com / student123
```

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth endpoints
- `POST /api/forgot-password` - Password reset request
- `POST /api/reset-password` - Password reset

### CRUD Operations
- `GET/POST /api/courses` - Course management
- `GET/POST /api/bookings` - Booking management
- `GET/POST /api/teachers` - Teacher management
- `GET/POST /api/payments` - Payment management

### File Upload
- `POST /api/upload` - MEGA file upload

## 📧 Email Configuration

Configure SMTP settings in environment variables:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@friendly-reminder.com
```

## 📤 MEGA Integration

Set up MEGA credentials for file storage:

```env
MEGA_EMAIL=your-mega-email@example.com
MEGA_PASSWORD=your-mega-password
```

## 🗄️ Database Schema

Key models:
- **User** - Authentication and profile
- **Teacher** - Teacher-specific data
- **Course** - Course information
- **Booking** - Course bookings
- **Payment** - Payment records

## 🐳 Docker Commands

```bash
# Development
npm run dev

# Production build
docker compose up --build -d

# View logs
docker compose logs -f web

# Stop services
docker compose down

# Reset database
docker compose down -v
docker compose up --build -d
```

## 🔍 Troubleshooting

1. **Database connection issues**: Check PostgreSQL is running and credentials are correct
2. **Email not sending**: Verify SMTP configuration
3. **MEGA upload fails**: Check MEGA credentials and network connectivity
4. **Build errors**: Ensure all dependencies are installed with `npm install`

## 📝 Development Notes

- All TypeScript errors related to missing modules will resolve after `npm install`
- The project uses FSD architecture for better code organization
- Debug UI is intentionally minimal for technical testing
- Role-based access control is implemented throughout the API
- File uploads are handled via MEGA for external storage

## 🚀 Next Steps

1. Install dependencies: `npm install`
2. Configure environment variables
3. Run database migrations
4. Start development server
5. Access debug pages to test functionality

---

**Note**: This is a backend-focused implementation with debug UI. The frontend can be enhanced with proper design and UX improvements as needed.
