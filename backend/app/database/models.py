from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    hashed_password = Column(String, nullable=True)  # Make password nullable for OAuth users
    google_id = Column(String, unique=True, nullable=True, index=True)  # Google ID for OAuth
    profile_picture = Column(String, nullable=True)  # URL to profile picture
    is_active = Column(Boolean, default=True)
    timezone = Column(String, default="UTC")  # Store user's timezone
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to SavedCalculations
    calculations = relationship("SavedCalculation", back_populates="user")

class SavedCalculation(Base):
    __tablename__ = "saved_calculations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    raw_data = Column(String)
    results = Column(JSON)  # Store the complete calculation results
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="calculations")
    categories = relationship("Category", back_populates="calculation")

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    calculation_id = Column(Integer, ForeignKey("saved_calculations.id"))
    name = Column(String)
    weight = Column(Float)
    assignments = Column(JSON)  # Store assignments as JSON
    
    # Relationship to SavedCalculation
    calculation = relationship("SavedCalculation", back_populates="categories")