from decimal import Decimal
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.inventory_batch import InventoryBatch
from app.models.grocery_run import GroceryRun
from app.models.product import Product
from app.schemas.inventory_batch import InventoryBatchCreate, InventoryBatchUpdate
from app.core.exceptions import QuantityValidationError

Qty = Decimal | None

def validate_and_get_completed_at(*, qty_added: Decimal, qty_used: Qty, qty_spoiled: Qty, qty_disposed: Qty):
    qty_used = qty_used or Decimal("0")
    qty_spoiled = qty_spoiled or Decimal("0")
    qty_disposed = qty_disposed or Decimal("0")

    if qty_added < 0 or qty_used < 0 or qty_spoiled < 0 or qty_disposed < 0:
        raise QuantityValidationError("Quantities must be >= 0")

    if qty_used + qty_spoiled + qty_disposed > qty_added:
        raise QuantityValidationError(
            "quantity_used + quantity_spoiled + quantity_disposed must be <= quantity_added"
        )

    # return datetime value if batch completed
    return func.now() if (qty_added - qty_used - qty_spoiled - qty_disposed) == 0 else None


class InventoryBatchDAL:
    """SQLAlchemy-backed data access helpers for `InventoryBatch` records."""
    def __init__(self, db: Session):
        self.db = db

    def create(self, *, user_id: int, data: InventoryBatchCreate) -> InventoryBatch:
        """Create and persist a new inventory batch."""
        # we must ensure the user owns both the grocery_run and product
        # associated with the new inventory batch
        grocery_run = (
            self.db.query(GroceryRun)
            .filter(GroceryRun.id == data.grocery_run_id)
            .first()
        )
        if not grocery_run or grocery_run.user_id != user_id:
            return None

        product = (
            self.db.query(Product)
            .filter(Product.id == data.product_id)
            .first()
        )
        if not product or product.user_id != user_id:
            return None

        # ensure all quantities are positive
        # ensure used + spoiled + disposed <= added
        # batch is completed if qty_added - qty_used - qty_spoiled - qty_disposed == 0
        # TODO: replace with DB level checks later
        completed_at = validate_and_get_completed_at(
            qty_added=data.quantity_added,
            qty_used=data.quantity_used,
            qty_spoiled=data.quantity_spoiled,
            qty_disposed=data.quantity_disposed,
        )

        inventory_batch = InventoryBatch(**data.model_dump())
        if not inventory_batch.storage_location:
            inventory_batch.storage_location = product.default_storage_location
        inventory_batch.completed_at = completed_at
        self.db.add(inventory_batch)
        self.db.flush()
        self.db.refresh(inventory_batch)
        return inventory_batch
    
    def get_by_id(self, *, user_id: int, inventory_batch_id: int) -> InventoryBatch | None:
        """Return a single inventory batch by id and user."""
        return (
            self.db.query(InventoryBatch)
            .join(InventoryBatch.grocery_run)
            .filter(GroceryRun.user_id == user_id, InventoryBatch.id == inventory_batch_id)
            .first()
        )
    
    def get_all_by_user_id(
        self,
        *,
        user_id: int,
        offset: int = 0,
        limit: int = 100,
        storage_location: str | None = None,
        grocery_run_id: int | None = None
    ) -> list[InventoryBatch]:
        """
        Return a paginated list of inventory batches for a user,
        with optional filters for storage_location and grocery_run_id.
        
        Joins grocery_runs on grocery_run_id.

        Orders by expired_at descending.
        """
        query = (
            self.db.query(InventoryBatch)
            .join(InventoryBatch.grocery_run)
            .filter(GroceryRun.user_id == user_id)
        )

        if storage_location:
            query = query.filter(InventoryBatch.storage_location == storage_location)
        if grocery_run_id:
            query = query.filter(InventoryBatch.grocery_run_id == grocery_run_id)
        return (
            query.order_by(InventoryBatch.expired_at.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )
    
    def update(
            self,
            *,
            user_id: int,
            inventory_batch_id: int,
            data: InventoryBatchUpdate
        ) -> InventoryBatch | None:
        inventory_batch = self.get_by_id(user_id=user_id, inventory_batch_id=inventory_batch_id)
        if not inventory_batch:
            return None
        # we get the patch object
        # excluse_unset=True so we don't overwrite with Pydantic model defaults, only actual passed through patch values
        # then overwrite the patched fields in the actual object (plus validate quantities)
        # TODO: replace with DB level checks later
        patch = data.model_dump(exclude_unset=True)
        completed_at = validate_and_get_completed_at(
            qty_added=patch.get("quantity_added", inventory_batch.quantity_added),
            qty_used=patch.get("quantity_used", inventory_batch.quantity_used),
            qty_spoiled=patch.get("quantity_spoiled", inventory_batch.quantity_spoiled),
            qty_disposed=patch.get("quantity_disposed", inventory_batch.quantity_disposed),
        )
        for field, val in patch.items():
            setattr(inventory_batch, field, val)

        inventory_batch.completed_at = completed_at

        self.db.flush()
        self.db.refresh(inventory_batch)
        return inventory_batch

    def delete_by_object(self, inventory_batch: InventoryBatch) -> None:
        self.db.delete(inventory_batch)
        self.db.flush()

    def delete_by_id(self, *, user_id: int, inventory_batch_id: int) -> bool:
        inventory_batch = self.get_by_id(user_id=user_id, inventory_batch_id=inventory_batch_id)
        if not inventory_batch:
            return False
        self.delete_by_object(inventory_batch)
        return True
