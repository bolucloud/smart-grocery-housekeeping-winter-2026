from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate
from app.core.exceptions import UniqueBarcodeError

class ProductDAL:
    """SQLAlchemy-backed data access helpers for `Product` records."""
    def __init__(self, db: Session):
        self.db = db

    def create(self, *, user_id: int, data: ProductCreate) -> Product:
        """Create and persist a new product."""
        product = Product(user_id=user_id, **data.model_dump())
        self.db.add(product)
        
        try:
            self.db.flush()
        except IntegrityError as e:
            self.db.rollback()
            # TODO: replace with generic handler
            # get constraint name off of e.orig (if it exists)
            if "ux_products_user_barcode_not_null" in str(getattr(e, "orig", e)):
                raise UniqueBarcodeError("A product with this barcode already exists")
            raise

        self.db.refresh(product)
        return product
    
    def get_by_id(self, *, user_id: int, product_id: int) -> Product | None:
        """Return a single product by id and user."""
        return (
            self.db.query(Product)
            .filter(Product.id == product_id, Product.user_id == user_id)
            .first()
        )
    
    def get_by_barcode(self, *, user_id: int, barcode: str) -> Product | None:
        """Return a single product by id and user."""
        return (
            self.db.query(Product)
            .filter(Product.user_id == user_id, Product.barcode == barcode)
            .first()
        )
    
    def get_all_by_user_id(
        self,
        *,
        user_id: int,
        offset: int = 0,
        limit: int = 100
    ) -> list[Product]:
        """Return a paginated list of products for a user."""
        return (
            self.db.query(Product)
            .filter(Product.user_id == user_id)
            .order_by(Product.name.asc())
            .offset(offset)
            .limit(limit)
            .all()
        )
    
    def update(
            self,
            *,
            user_id: int,
            product_id: int,
            data: ProductUpdate
        ) -> Product | None:
        product = self.get_by_id(user_id=user_id, product_id=product_id)
        if not product:
            return None
        
        # we get the patch object
        # excluse_unset=True so we don't overwrite with Pydantic model defaults, only actual passed through patch values
        # then overwrite the patched fields in the actual object
        patch_product = data.model_dump(exclude_unset=True)
        for field, val in patch_product.items():
            setattr(product, field, val)

        try:
            self.db.flush()
        except IntegrityError as e:
            self.db.rollback()
            # TODO: replace with generic handler
            # get constraint name off of e.orig (if it exists)
            if "ux_products_user_barcode_not_null" in str(getattr(e, "orig", e)):
                raise UniqueBarcodeError("A product with this barcode already exists")
            raise

        self.db.refresh(product)
        return product

    def delete_by_object(self, product: Product) -> None:
        self.db.delete(product)
        self.db.flush()

    def delete_by_id(self, *, user_id: int, product_id: int) -> bool:
        product = self.get_by_id(user_id=user_id, product_id=product_id)
        if not product:
            return False
        self.delete_by_object(product)
        return True
