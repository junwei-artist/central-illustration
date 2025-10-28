# Central Illustration - Demonstration Hub

A modern full-stack platform for showcasing innovative projects with beautiful demonstrations, built with Next.js, FastAPI, PostgreSQL, and Tailwind CSS.

## 🚀 Features

- **Beautiful SaaS Landing Page** - Modern hero section with SVG animations and dynamic motions
- **Project Demonstrations** - Each demo in its own folder with customizable content
- **Admin Dashboard** - Full control over project visibility, descriptions, and management
- **User Comments** - Interactive discussions and feedback for each demonstration
- **SVG Animations** - Stunning visual effects powered by Framer Motion and Tailwind CSS
- **Responsive Design** - Mobile-first approach with beautiful UI/UX

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router) - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - Database ORM
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **Pydantic** - Data validation

## 📦 Installation

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Quick Start with Docker

1. Clone the repository:
```bash
git clone <your-repo-url>
cd central-illustration
```

2. Start all services:
```bash
docker-compose up -d
```

3. Initialize the database:
```bash
docker-compose exec backend python db/init_db.py
```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Local Development

#### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with your database URL

# Run database migrations
python db/init_db.py

# Start backend server
uvicorn main:app --reload
```

#### Frontend Setup

```bash
cd frontend
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your API URL

# Start development server
npm run dev
```

## 🔐 Default Credentials

After running `db/init_db.py`, a default admin user is created:

- **Username:** `admin`
- **Password:** `admin123`

**⚠️ Important:** Change these credentials in production!

## 🔧 Command Files

For easy macOS development, use these executable command files:

- **`install-backend.command`** - Set up Python backend environment
- **`run-illustration-backend.command`** - Start the backend server
- **`install-frontend.command`** - Set up Next.js frontend environment
- **`run-illustration-frontend.command`** - Start the frontend development server
- **`build-frontend.command`** - Build frontend for production

📖 See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed instructions on using these commands.

## 📁 Project Structure

```
central-illustration/
├── backend/                 # FastAPI backend
│   ├── api/                # API routes
│   │   ├── auth.py         # Authentication endpoints
│   │   ├── demos.py        # Demo management
│   │   └── comments.py     # Comments endpoints
│   ├── models/             # Database models
│   ├── schemas/            # Pydantic schemas
│   ├── db/                 # Database setup
│   ├── core/               # Core configuration
│   └── main.py             # FastAPI app
├── frontend/               # Next.js frontend
│   ├── app/                # App router pages
│   │   ├── page.tsx        # Landing page
│   │   ├── demos/          # Demo pages
│   │   └── admin/          # Admin dashboard
│   ├── components/         # React components
│   └── lib/                # Utilities
└── projects/               # Demo projects
    ├── demo-1/             # Example demo
    ├── animated-shapes/    # SVG animations
    └── svg-dashboard/      # Dashboard demo
```

## 🎨 Creating a New Demonstration

1. **Create a folder** in `/projects/` with your demo name (e.g., `my-awesome-demo`)
2. **Add an `index.html`** file with your demo content
3. **Go to Admin Dashboard** (http://localhost:3000/admin)
4. **Click "Add Demo"** and fill in:
   - Title: Your demo title
   - Description: Brief description
   - Folder Name: Must match the folder name exactly
   - URL: Optional external link
   - Visibility: Check to make it public

## 🗄️ Database Schema

### Users
- Admins can manage demonstrations
- Regular users can comment

### Demonstrations
- Title, description, folder_name
- Visibility toggle
- URL (optional)

### Comments
- Linked to demonstrations
- User authentication required

## 🔧 API Endpoints

### Public Endpoints
- `GET /demos` - List visible demonstrations
- `GET /demos/{id}` - Get demo details
- `GET /comments/{demo_id}` - List comments

### Protected Endpoints (Login Required)
- `POST /comments` - Create comment

### Admin Only
- `POST /demos` - Create demonstration
- `PUT /demos/{id}` - Update demonstration
- `DELETE /demos/{id}` - Delete demonstration

## 🚢 Deployment

### Using Docker Compose

For production deployment:

1. Update environment variables in `docker-compose.yml`
2. Set secure `SECRET_KEY` in backend
3. Configure proper database credentials
4. Run:
```bash
docker-compose up -d
```

### Environment Variables

**Backend** (`.env`):
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret key
- `CORS_ORIGINS` - Allowed frontend origins

**Frontend** (`.env.local`):
- `NEXT_PUBLIC_API_URL` - Backend API URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License - feel free to use for your projects!

## 🎯 Roadmap

- [ ] Add more demo templates
- [ ] Implement file uploads for demos
- [ ] Add analytics tracking
- [ ] Support for multiple themes
- [ ] Export/import demonstrations
- [ ] AI-powered demo descriptions

## 📧 Support

For questions or issues, please open a GitHub issue.

---

Built with ❤️ using Next.js, FastAPI, and PostgreSQL

