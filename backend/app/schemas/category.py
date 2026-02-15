from datetime import datetime
from pydantic import BaseModel, ConfigDict


class CategoryCreate(BaseModel):
    category_name: str


class CategoryUpdate(BaseModel):
    # all fields optional since we are using PATCH to update
    category_name: str | None = None


class CategoryRead(BaseModel):
    category_id: int
    category_name: str
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)