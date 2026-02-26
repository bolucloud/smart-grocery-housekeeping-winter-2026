from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from app.db.base import Base
from sqlalchemy.orm import DeclarativeBase


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    firebase_uid = Column(String, unique=True, nullable=False) 
    display_name = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    # Relationships
    products = relationship("Product", back_populates="user", cascade="all, delete-orphan")
    grocery_runs = relationship("GroceryRun", back_populates="user", cascade="all, delete-orphan")
