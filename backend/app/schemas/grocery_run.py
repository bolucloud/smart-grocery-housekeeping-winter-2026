from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict


class GroceryRunCreate(BaseModel):
    # user_id will come from auth context
    trip_date: date
    store_name: str | None = None
    total_cost: Decimal | None = None
    notes: str | None = None
    archived: bool = False


class GroceryRunUpdate(BaseModel):
    # all fields optional since we are using PATCH to update
    trip_date: date | None = None
    store_name: str | None = None
    total_cost: Decimal | None = None
    notes: str | None = None
    archived: bool | None = None


class GroceryRunRead(BaseModel):
    id: int
    user_id: int
    trip_date: date
    store_name: str | None = None
    total_cost: Decimal | None = None
    notes: str | None = None
    archived: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
