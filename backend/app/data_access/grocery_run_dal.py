from sqlalchemy.orm import Session, joinedload
from app.models.grocery_run import GroceryRun
from app.schemas.grocery_run import GroceryRunCreate, GroceryRunUpdate


class GroceryRunDAL:
    """SQLAlchemy-backed data access helpers for `GroceryRun` records."""
    def __init__(self, db: Session):
        self.db = db

    def create(self, *, user_id: int, data: GroceryRunCreate) -> GroceryRun:
        """Create and persist a new grocery run."""
        grocery_run = GroceryRun(user_id=user_id, **data.model_dump())
        self.db.add(grocery_run)
        self.db.flush()
        self.db.refresh(grocery_run)
        return grocery_run
    
    def get_by_id(self, *, user_id: int, grocery_run_id: int) -> GroceryRun | None:
        """Return a single grocery run by id and user."""
        return (
            self.db.query(GroceryRun)
            .options(joinedload(GroceryRun.inventory_batches))
            .filter(GroceryRun.id == grocery_run_id, GroceryRun.user_id == user_id)
            .first()
        )
    
    def get_all_by_user_id(
        self,
        *,
        user_id: int,
        offset: int = 0,
        limit: int = 100,
        archived: bool | None = None,
    ) -> list[GroceryRun]:
        """Return a paginated list of grocery runs for a user."""
        query = self.db.query(GroceryRun).filter(GroceryRun.user_id == user_id)

        if archived is not None:
            query = query.filter(GroceryRun.archived == archived)

        # just going with a logical default for ordering currently
        return (
            query.order_by(GroceryRun.trip_date.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )
    
    def update(
            self,
            *,
            user_id: int,
            grocery_run_id: int,
            data: GroceryRunUpdate
        ) -> GroceryRun | None:
        grocery_run = self.get_by_id(user_id=user_id, grocery_run_id=grocery_run_id)
        if not grocery_run:
            return None
        
        # we get the patch object
        # excluse_unset=True so we don't overwrite with Pydantic model defaults, only actual passed through patch values
        # then overwrite the patched fields in the actual object
        patch_grocery_run = data.model_dump(exclude_unset=True)
        for field, val in patch_grocery_run.items():
            setattr(grocery_run, field, val)

        self.db.flush()
        self.db.refresh(grocery_run)
        return grocery_run

    def delete_by_object(self, grocery_run: GroceryRun) -> None:
        self.db.delete(grocery_run)
        self.db.flush()

    def delete_by_id(self, *, user_id: int, grocery_run_id: int) -> bool:
        grocery_run = self.get_by_id(user_id=user_id, grocery_run_id=grocery_run_id)
        if not grocery_run:
            return False
        self.delete_by_object(grocery_run)
        return True
