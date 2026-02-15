from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.schemas.product import ProductRead, ProductCreate, ProductUpdate

from app.api.deps import get_current_user_id
from app.data_access.product_dal import ProductDAL
from app.data_access.deps import get_product_dal

router = APIRouter()

@router.get("/", response_model=list[ProductRead])
def get_products(
    user_id: int = Depends(get_current_user_id),
    product_dal: ProductDAL = Depends(get_product_dal),
    offset: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200)
):
    return product_dal.get_all_by_user_id(user_id=user_id, offset=offset, limit=limit)


@router.post("/", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_product(
    data: ProductCreate,
    user_id: int = Depends(get_current_user_id),
    product_dal: ProductDAL = Depends(get_product_dal)
):
    return product_dal.create(user_id=user_id, data=data)


@router.get("/{product_id}", response_model=ProductRead)
def get_product(
    product_id: int,
    user_id: int = Depends(get_current_user_id),
    product_dal: ProductDAL = Depends(get_product_dal)
):
    product = product_dal.get_by_id(user_id=user_id, product_id=product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product {product_id} not found"
        )
    return product


@router.patch("/{product_id}", response_model=ProductRead)
def patch_product(
    data: ProductUpdate,
    product_id: int,
    user_id: int = Depends(get_current_user_id),
    product_dal: ProductDAL = Depends(get_product_dal)
):
    product = product_dal.update(user_id=user_id, product_id=product_id, data=data)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product {product_id} not found"
        )
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    user_id: int = Depends(get_current_user_id),
    product_dal: ProductDAL = Depends(get_product_dal)
):
    product_dal.delete_by_id(user_id=user_id, product_id=product_id)

@router.get("/by-barcode/{barcode}", response_model=ProductRead)
def get_product(
    barcode: str,
    user_id: int = Depends(get_current_user_id),
    product_dal: ProductDAL = Depends(get_product_dal)
):
    product = product_dal.get_by_barcode(user_id=user_id, barcode=barcode)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with barcode {barcode} not found"
        )
    return product
