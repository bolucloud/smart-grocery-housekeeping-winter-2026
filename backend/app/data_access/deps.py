from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.data_access.user_dal import UserDAL
from app.data_access.grocery_run_dal import GroceryRunDAL
from app.data_access.product_dal import ProductDAL
from app.data_access.inventory_batch_dal import InventoryBatchDAL


def get_user_dal(db: Session = Depends(get_db)) -> UserDAL:
    return UserDAL(db)

def get_grocery_run_dal(db: Session = Depends(get_db)) -> GroceryRunDAL:
    return GroceryRunDAL(db)


def get_product_dal(db: Session = Depends(get_db)) -> ProductDAL:
    return ProductDAL(db)


def get_inventory_batch_dal(db: Session = Depends(get_db)) -> InventoryBatchDAL:
    return InventoryBatchDAL(db)
