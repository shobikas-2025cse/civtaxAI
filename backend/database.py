import os
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./civtax.db")

Base = declarative_base()

def _create_engine_with_fallback(primary_url: str):
    if primary_url and not primary_url.startswith("sqlite"):
        try:
            pg_engine = create_engine(
                primary_url,
                connect_args={"connect_timeout": 5},
                pool_pre_ping=True,
                pool_timeout=5,
                pool_recycle=300,
            )
            # Test connection
            with pg_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Successfully connected to Supabase PostgreSQL.")
            return pg_engine
        except Exception as e:
            logger.warning(f"Could not connect to PostgreSQL ({e}). Falling back to local SQLite database.")
    
    sqlite_url = "sqlite:///./civtax.db"
    sqlite_engine = create_engine(
        sqlite_url,
        connect_args={"check_same_thread": False}
    )
    logger.info("Using local SQLite database engine.")
    return sqlite_engine

engine = _create_engine_with_fallback(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

