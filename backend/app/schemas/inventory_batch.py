from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict
from app.models.enums import StorageLocation


class InventoryBatchCreate(BaseModel):
    # do we want the ability to start with some used/spoiled/disposed?
    grocery_run_id: int
    product_id: int
    quantity_added: Decimal
    storage_location: StorageLocation | None = None
    expired_at: datetime | None = None


class InventoryBatchUpdate(BaseModel):
    # all fields optional since we are using PATCH to update
    grocery_run_id: int | None = None
    product_id: int | None = None
    quantity_added: Decimal | None = None
    quantity_used: Decimal | None = None
    quantity_spoiled: Decimal | None = None
    quantity_disposed: Decimal | None = None
    storage_location: StorageLocation | None = None
    expired_at: datetime | None = None
    completed_at: datetime | None = None


class InventoryBatchRead(BaseModel):
    id: int
    grocery_run_id: int
    product_id: int

    quantity_added: Decimal
    quantity_used: Decimal
    quantity_spoiled: Decimal
    quantity_disposed: Decimal
    quantity_current: Decimal

    storage_location: StorageLocation | None = None

    added_at: datetime
    expired_at: datetime | None = None
    updated_at: datetime
    completed_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)