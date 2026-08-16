import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database connection URL from environment variable
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

if not SQLALCHEMY_DATABASE_URL:
    raise ValueError(
        "DATABASE_URL environment variable is not set. "
        "Please configure DATABASE_URL in backend/.env with your Supabase PostgreSQL connection string."
    )

if "[YOUR-PASSWORD]" in SQLALCHEMY_DATABASE_URL or "YOUR_PASSWORD" in SQLALCHEMY_DATABASE_URL:
    raise ValueError(
        "Found placeholder '[YOUR-PASSWORD]' in backend/.env. "
        "Please edit backend/.env and replace '[YOUR-PASSWORD]' with your actual Supabase database password."
    )

connect_args = {}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# Create engine — using a short connect_timeout so startup doesn't hang for 60s
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={**connect_args, "connect_timeout": 10} if not SQLALCHEMY_DATABASE_URL.startswith("sqlite") else connect_args,
    pool_pre_ping=True if not SQLALCHEMY_DATABASE_URL.startswith("sqlite") else False,
    pool_timeout=10,
    pool_recycle=300,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
