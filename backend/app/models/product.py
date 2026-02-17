from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
    func,
    Enum,
    Numeric,
    Index,
)
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.models.enums import ProductType, StorageLocation


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.category_id", ondelete="SET NULL"), nullable=True)

    name = Column(String, nullable=False)
    brand = Column(String, nullable=True)
    size = Column(String, nullable=True)
    # should this be an ENUM eventually? maybe for now we enforce normalization via frontend options
    unit = Column(String, nullable=True)
    type = Column(Enum(ProductType, name="product_type"), nullable=False)
    barcode = Column(String, nullable=True)

    # store optional default here, actual location on batch
    default_storage_location = Column(
        Enum(StorageLocation, name="storage_location"),
        nullable=True,
    )
    shelf_life_days = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="products")
    category = relationship("Category", back_populates="products")
    inventory_batches = relationship("InventoryBatch", back_populates="product")

    __table_args__ = (
        Index("ix_products_user_id", "user_id"),
        Index("ix_products_user_category", "user_id", "category_id"),
        # barcode should be unique per user
        # only enforced when the barcode is present
        # TODO: need to add handler for unique constraint violation
        # I want to add a generic handler for constraint violations
        Index(
            "ux_products_user_barcode_not_null",
            "user_id",
            "barcode",
            unique=True,
            postgresql_where=(barcode.isnot(None)),
        ),
    )
