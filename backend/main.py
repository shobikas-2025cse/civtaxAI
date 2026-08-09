from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models
from database import engine

# Import routers
from routers import citizens, taxes, collector, admin, ai

# Ensure tables are created
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CivTax API",
    description="Backend API for CivTax Municipal Tax Platform",
    version="1.0.0"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root level endpoints that might not fit perfectly into one of the routers
from routers.taxes import router as taxes_router
import crud
from database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends

# Include routers
app.include_router(citizens.router, prefix="/api/v1")
app.include_router(taxes_router, prefix="/api/v1")
app.include_router(collector.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")

@app.get("/api/v1/wards")
def get_wards(db: Session = Depends(get_db)):
    return crud.get_all_wards(db)

@app.get("/api/v1/leaderboard")
def get_leaderboard(limit: int = 5, db: Session = Depends(get_db)):
    return crud.get_leaderboard(db, limit=limit)

@app.get("/")
def read_root():
    return {"message": "Welcome to CivTax API. Go to /docs for the swagger documentation."}

