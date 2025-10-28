# Database Setup Summary

## ✅ Database Configuration Complete!

Your PostgreSQL database has been successfully set up for Central Illustration.

## 📊 Database Details

### Connection Information

- **Database Name:** `demodb`
- **Superuser:** `junwei` (with password you set: `sales002Q`)
- **App User:** `demoapp`
- **App Password:** `demoapp123`
- **Host:** `localhost`
- **Port:** `5432`

### Connection String

```
postgresql://demoapp:demoapp123@localhost:5432/demodb
```

## 🗄️ Database Tables Created

1. **`app_user`** - User accounts with roles
   - id (UUID)
   - username
   - email
   - hashed_password
   - role (ADMIN or USER)
   - is_active
   - created_at

2. **`demonstration`** - Demo projects
   - id
   - title
   - description
   - folder_name
   - url
   - is_visible
   - created_by
   - created_at
   - updated_at

3. **`comment`** - User comments on demos
   - id
   - content
   - demo_id
   - user_id
   - created_at

## 👤 Default Admin Account

- **Username:** `admin`
- **Password:** `admin123`
- **Email:** `admin@example.com`
- **Role:** `ADMIN`

⚠️ **Important:** Change the default password in production!

## 📁 Environment Configuration

The backend `.env` file has been configured with:

```env
DATABASE_URL=postgresql://demoapp:demoapp123@localhost:5432/demodb
SECRET_KEY=your-secret-key-change-in-production-for-security
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=["http://localhost:3000","http://localhost:3001"]
```

## 🚀 Next Steps

### 1. Start the Backend Server

```bash
./run-illustration-backend.command
```

Or manually:
```bash
cd backend
source venv/bin/activate
PYTHONPATH=. uvicorn main:app --reload
```

### 2. Start the Frontend Server

```bash
./run-illustration-frontend.command
```

Or manually:
```bash
cd frontend
npm run dev
```

### 3. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

### 4. Login

Use the admin credentials:
- Username: `admin`
- Password: `admin123`

## 🔍 Verification Commands

You can verify the database setup using these commands:

### List all tables
```bash
psql -U demoapp -d demodb -c "\dt"
```

### View users
```bash
psql -U demoapp -d demodb -c "SELECT username, email, role FROM app_user;"
```

### Count zones
```bash
psql -U demoapp -d demodb -c "SELECT COUNT(*) FROM app_user;"
```

## 🔐 Security Notes

1. **Change Default Password:** The default admin password is `admin123`. Change it immediately in production.

2. **Update SECRET_KEY:** The JWT secret key in `.env` should be changed to a secure random string for production.

3. **Database Access:** The app user (`demoapp`) has full access to the `demodb` database. Use this for the application connection.

4. **Superuser Access:** Keep the `junwei` superuser credentials secure and use only for administrative tasks.

## 📝 Database Management

### Backup Database
```bash
pg_dump -U junwei -d demodb > backup.sql
```

### Restore Database
```bash
psql -U junwei -d demodb < backup.sql
```

### Drop and Recreate (CAUTION: Deletes all data)
```bash
psql -U junwei -d postgres -c "DROP DATABASE demodb;"
psql -U junwei -d postgres -c "CREATE DATABASE demodb;"
cd backend && source venv/bin/activate && PYTHONPATH=. python db/init_db.py
```

## 🎉 Setup Complete!

Your database is ready to use. You can now:
- ✅ Run the backend server
- ✅ Run the frontend server
- ✅ Login as admin
- ✅ Create and manage demonstrations
- ✅ Add comments and discussions

---

For more information, see:
- [README.md](README.md) - Full documentation
- [LOCAL_SETUP.md](LOCAL_SETUP.md) - Local setup guide
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Using the command files

