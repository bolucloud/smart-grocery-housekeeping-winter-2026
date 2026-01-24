from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from db import Base

class Category(Base):

    __tablename__ = "categories"

    category_id = Column(Integer, primary_key=True)
    category_name = Column(String, nullable=False)
    updated_at = Column(DateTime, nullable=False, server_default=func.now())clear

    # Relationships