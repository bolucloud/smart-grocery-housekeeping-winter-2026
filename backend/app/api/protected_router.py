from fastapi import APIRouter, Depends
from app.api.deps import get_firebase_claims
from app.api.routes import user, grocery_run, inventory_batch, product, recognizeItem, lookupBarcode


private_api_router = APIRouter(
    dependencies=[Depends(get_firebase_claims)]
)

private_api_router.include_router(user.router, prefix="/user",  tags=["user"])
private_api_router.include_router(grocery_run.router, prefix="/grocery-runs",  tags=["grocery runs"])
private_api_router.include_router(product.router, prefix="/products",  tags=["products"])
private_api_router.include_router(inventory_batch.router, prefix="/inventory-batches",  tags=["inventory batches"])
private_api_router.include_router(recognizeItem.router,prefix="/recognizeItem" , tags=["recognizeItem"])
private_api_router.include_router(lookupBarcode.router,prefix="/lookupBarcode" , tags=["lookupBarcode"])
private_api_router.include_router(grocery_run.router, prefix="/grocery-runs",  tags=["grocery runs"])
private_api_router.include_router(product.router, prefix="/products",  tags=["products"])
private_api_router.include_router(inventory_batch.router, prefix="/inventory-batches",  tags=["inventory batches"])