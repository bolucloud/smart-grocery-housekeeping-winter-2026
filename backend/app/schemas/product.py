from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict
from app.models.enums import ProductType, StorageLocation


class ProductCreate(BaseModel):
    # user_id will come from auth context
    category_id: int | None = None
    name: str
    brand: str | None = None
    size: str | None = None
    unit: str | None = None
    type: ProductType
    barcode: str | None = None

    default_storage_location: StorageLocation | None = None
    shelf_life_days: int | None = None


class ProductUpdate(BaseModel):
    # all fields optional since we are using PATCH to update
    category_id: int | None = None
    name: str | None = None
    brand: str | None = None
    size: str | None = None
    unit: str | None = None
    type: ProductType | None = None
    barcode: str | None = None

    default_storage_location: StorageLocation | None = None
    shelf_life_days: int | None = None


class ProductRead(BaseModel):
    id: int
    user_id: int
    category_id: int | None = None

    name: str
    brand: str | None = None
    size: str | None = None
    unit: str | None = None
    type: ProductType
    barcode: str | None = None

    default_storage_location: StorageLocation | None = None
    shelf_life_days: int | None = None

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)