from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from sqlalchemy.orm import Session

# Get database URL from environment variable with fallback for development
database_url_raw = os.getenv("DATABASE_URL", "sqlite:///./grades.db")

# Check if it's a Digital Ocean placeholder
if database_url_raw.startswith("${db."):
    # Use our manually set DATABASE_URL instead
    DATABASE_URL = os.getenv("MANUALLY_SET_DATABASE_URL", "sqlite:///./grades.db")
    print(f"Using manual database URL instead of Digital Ocean placeholder")
else:
    DATABASE_URL = database_url_raw

# Add SQLALCHEMY_DATABASE_URL for compatibility with alembic
SQLALCHEMY_DATABASE_URL = DATABASE_URL

print(f"Using database connection: {DATABASE_URL[:20]}...")

# Handle special case for SQLite
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """
    Dependency to get a database session.
    Yields a database session, and ensures it's closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        