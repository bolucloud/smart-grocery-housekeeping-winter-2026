from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    Date,
    DateTime,
    func,
    Text,
    Boolean,
    Numeric,
    Index,
)
from sqlalchemy.orm import relationship

from app.db.base import Base


class GroceryRun(Base):
    __tablename__ = "grocery_runs"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    trip_date = Column(Date, nullable=False)
    store_name = Column(String, nullable=True)
    total_cost = Column(Numeric(12, 2), nullable=True)
    notes = Column(Text, nullable=True)
    archived = Column(Boolean, nullable=False, server_default="false")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="grocery_runs")
    # should this delete-orphan? I guess so? and we rely on user to archive if they
    # want to keep around for stats, otherwise they hard delete?
    inventory_batches = relationship(
        "InventoryBatch",
        back_populates="grocery_run",
        cascade="all, delete-orphan", 
    )

    __table_args__ = (
        Index("ix_grocery_runs_user_id", "user_id"),
        Index("ix_grocery_runs_user_trip_date", "user_id", "trip_date"),
        Index("ix_grocery_runs_user_archived", "user_id", "archived"),
    )
