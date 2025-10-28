from db.session import engine, Base
from models import User, Demonstration, Comment
from core.security import get_password_hash


def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)
    
    # Create default admin user
    from sqlalchemy.orm import Session
    db = Session(bind=engine)
    
    try:
        # Check if admin already exists
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            admin = User(
                username="admin",
                email="admin@example.com",
                hashed_password=get_password_hash("admin123"),
                role="admin"
            )
            db.add(admin)
            db.commit()
            print("Default admin user created: username=admin, password=admin123")
    except Exception as e:
        print(f"Error creating admin user: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    init_db()

