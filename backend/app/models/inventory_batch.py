from sqlalchemy import (
    Column,
    Integer,
    ForeignKey,
    DateTime,
    func,
    Numeric,
    CheckConstraint,
    Enum,
    Computed,
    Index
)
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.models.enums import StorageLocation


class InventoryBatch(Base):
    __tablename__ = "inventory_batches"

    id = Column(Integer, primary_key=True)
    grocery_run_id = Column(Integer, ForeignKey("grocery_runs.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="RESTRICT"), nullable=False)

    # quantities are counts of a product
    quantity_added = Column(Numeric(6, 2), nullable=False)
    quantity_used = Column(Numeric(6, 2), nullable=False, server_default="0")
    quantity_spoiled = Column(Numeric(6, 2), nullable=False, server_default="0")
    quantity_disposed = Column(Numeric(6, 2), nullable=False, server_default="0")

    quantity_current = Column(
        Numeric(6, 2),
        Computed(
            "quantity_added - quantity_used - quantity_spoiled - quantity_disposed",
            persisted=True,
        ),
        nullable=False,
    )

    storage_location = Column(Enum(StorageLocation, name="storage_location"), nullable=True)

    added_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expired_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    grocery_run = relationship("GroceryRun", back_populates="inventory_batches")
    product = relationship("Product", back_populates="inventory_batches")

    # TODO: need to add generic error handling for these constraint violations
    # before adding them at the DB level like this
    __table_args__ = (
        # CheckConstraint("quantity_added >= 0", name="ck_batch_qty_added_nonneg"),
        # CheckConstraint("quantity_used >= 0", name="ck_batch_qty_used_nonneg"),
        # CheckConstraint("quantity_spoiled >= 0", name="ck_batch_qty_spoiled_nonneg"),
        # CheckConstraint("quantity_disposed >= 0", name="ck_batch_qty_disposed_nonneg"),
        # CheckConstraint(
        #     "(quantity_used + quantity_spoiled + quantity_disposed) <= quantity_added",
        #     name="ck_batch_qty_sum_le_added",
        # ),

        Index("ix_batches_run_completed", "grocery_run_id", "completed_at"),
        Index("ix_batches_expired_at", "expired_at"),
        Index("ix_batches_product_id", "product_id"),
    )
