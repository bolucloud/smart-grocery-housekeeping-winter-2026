from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.schemas.grocery_run import GroceryRunRead, GroceryRunCreate, GroceryRunUpdate

from app.api.deps import get_current_user_id
from app.data_access.grocery_run_dal import GroceryRunDAL
from app.data_access.deps import get_grocery_run_dal

router = APIRouter()

@router.get("/", response_model=list[GroceryRunRead])
def get_grocery_runs(
    user_id: int = Depends(get_current_user_id),
    grocery_run_dal: GroceryRunDAL = Depends(get_grocery_run_dal),
    offset: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200)
):
    return grocery_run_dal.get_all_by_user_id(user_id=user_id, offset=offset, limit=limit)


@router.post("/", response_model=GroceryRunRead, status_code=status.HTTP_201_CREATED)
def create_grocery_run(
    data: GroceryRunCreate,
    user_id: int = Depends(get_current_user_id),
    grocery_run_dal: GroceryRunDAL = Depends(get_grocery_run_dal)
):
    return grocery_run_dal.create(user_id=user_id, data=data)


@router.get("/{grocery_run_id}", response_model=GroceryRunRead)
def get_grocery_run(
    grocery_run_id: int,
    user_id: int = Depends(get_current_user_id),
    grocery_run_dal: GroceryRunDAL = Depends(get_grocery_run_dal)
):
    grocery_run = grocery_run_dal.get_by_id(user_id=user_id, grocery_run_id=grocery_run_id)
    if not grocery_run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Grocery run {grocery_run_id} not found"
        )
    return grocery_run


@router.patch("/{grocery_run_id}", response_model=GroceryRunRead)
def patch_grocery_run(
    data: GroceryRunUpdate,
    grocery_run_id: int,
    user_id: int = Depends(get_current_user_id),
    grocery_run_dal: GroceryRunDAL = Depends(get_grocery_run_dal)
):
    grocery_run = grocery_run_dal.update(user_id=user_id, grocery_run_id=grocery_run_id, data=data)
    if not grocery_run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Grocery run {grocery_run_id} not found"
        )
    return grocery_run


@router.delete("/{grocery_run_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_grocery_run(
    grocery_run_id: int,
    user_id: int = Depends(get_current_user_id),
    grocery_run_dal: GroceryRunDAL = Depends(get_grocery_run_dal)
):
    grocery_run_dal.delete_by_id(user_id=user_id, grocery_run_id=grocery_run_id)
