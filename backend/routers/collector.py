from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Any

import crud, models, schemas
from database import get_db

router = APIRouter(prefix="/collector", tags=["collector"])

@router.get("/metrics")
def get_collector_metrics(db: Session = Depends(get_db)):
    return crud.get_collector_metrics(db)

@router.get("/stages")
def get_collector_stages(db: Session = Depends(get_db)):
    return crud.get_collector_stages(db)

@router.get("/payment-methods")
def get_payment_methods(db: Session = Depends(get_db)):
    return crud.get_collector_payment_methods(db)

@router.get("/defaulters")
def get_defaulters(limit: int = 10, db: Session = Depends(get_db)):
    citizens = db.query(models.Citizen).filter(models.Citizen.outstanding_dues > 0).order_by(models.Citizen.outstanding_dues.desc()).limit(limit).all()
    return [crud.format_citizen(c) for c in citizens]

@router.get("/recent-payments")
def get_recent_payments(limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_recent_payments(db, limit=limit)


