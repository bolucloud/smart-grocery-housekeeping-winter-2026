# from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
# from sqlalchemy.orm import relationship
# from db import Base


# class Product(Base):
#     __tablename__ = "products"

#     id = Column(Integer, primary_key=True)
#     name = Column(String, nullable=False)
#     category_id = Column(Integer, ForeignKey("categories.category_id"), nullable=False)
#     user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
#     shelf_life_days = Column(Integer, nullable=True)
#     created_at = Column(DateTime, nullable=False, server_default=func.now())
#     updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    # Relationships