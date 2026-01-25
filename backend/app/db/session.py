# This creates the SQLAlchemy engine + DB sessions.

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import DATABASE_URL

engine = create_engine(DATABASE_URL, pool_pre_ping=True) #Manages DB connections & pooling

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) #Manages transactions & ORM state per request
