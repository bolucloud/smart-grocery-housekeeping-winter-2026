from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.schemas.inventory_batch import InventoryBatchRead, InventoryBatchCreate, InventoryBatchUpdate

from app.api.deps import get_current_user_id
from app.data_access.inventory_batch_dal import InventoryBatchDAL
from app.core.exceptions import QuantityValidationError
from app.data_access.deps import get_inventory_batch_dal
from app.models.enums import StorageLocation

router = APIRouter()

@router.get("/", response_model=list[InventoryBatchRead])
def get_inventory_batches(
    user_id: int = Depends(get_current_user_id),
    inventory_batch_dal: InventoryBatchDAL = Depends(get_inventory_batch_dal),
    offset: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    storage_location: StorageLocation | None = Query(None),
    grocery_run_id: int | None = Query(None)
):
    return inventory_batch_dal.get_all_by_user_id(
        user_id=user_id,
        offset=offset,
        limit=limit,
        storage_location=storage_location,
        grocery_run_id=grocery_run_id
    )


@router.post("/", response_model=InventoryBatchRead, status_code=status.HTTP_201_CREATED)
def create_inventory_batch(
    data: InventoryBatchCreate,
    user_id: int = Depends(get_current_user_id),
    inventory_batch_dal: InventoryBatchDAL = Depends(get_inventory_batch_dal)
):
    try:
        batch = inventory_batch_dal.create(user_id=user_id, data=data)
    except QuantityValidationError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=str(e))
    # returning a 404 here because a 403 might be bad security optics
    # all they need to know is they provided a referenced resource that couldn't be found
    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Referenced resource not found"
        )
    return batch


@router.get("/{inventory_batch_id}", response_model=InventoryBatchRead)
def get_inventory_batch(
    inventory_batch_id: int,
    user_id: int = Depends(get_current_user_id),
    inventory_batch_dal: InventoryBatchDAL = Depends(get_inventory_batch_dal)
):
    inventory_batch = inventory_batch_dal.get_by_id(user_id=user_id, inventory_batch_id=inventory_batch_id)
    if not inventory_batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"InventoryBatch {inventory_batch_id} not found"
        )
    return inventory_batch


@router.patch("/{inventory_batch_id}", response_model=InventoryBatchRead)
def patch_inventory_batch(
    data: InventoryBatchUpdate,
    inventory_batch_id: int,
    user_id: int = Depends(get_current_user_id),
    inventory_batch_dal: InventoryBatchDAL = Depends(get_inventory_batch_dal)
):
    try:
        inventory_batch = inventory_batch_dal.update(user_id=user_id, inventory_batch_id=inventory_batch_id, data=data)
    except QuantityValidationError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=str(e))
    if not inventory_batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"InventoryBatch {inventory_batch_id} not found"
        )
    return inventory_batch


@router.delete("/{inventory_batch_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_inventory_batch(
    inventory_batch_id: int,
    user_id: int = Depends(get_current_user_id),
    inventory_batch_dal: InventoryBatchDAL = Depends(get_inventory_batch_dal)
):
    inventory_batch_dal.delete_by_id(user_id=user_id, inventory_batch_id=inventory_batch_id)
