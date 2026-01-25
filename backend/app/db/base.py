from sqlalchemy.orm import DeclarativeBase


# Every SQLAlchemy model class must inherit from Base
#It registers the tables so SQLAlchemy knows them

class Base(DeclarativeBase):
    pass
