from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Any

import crud, models, schemas
from database import get_db

router = APIRouter(prefix="/citizens", tags=["citizens"])

@router.get("")
def read_citizens(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_citizens(db, skip=skip, limit=limit)

@router.get("/{citizen_id}")
def read_citizen(citizen_id: str, db: Session = Depends(get_db)):
    db_citizen = crud.get_citizen_by_id(db, citizen_id=citizen_id)
    if db_citizen is None:
        raise HTTPException(status_code=404, detail="Citizen not found")
    return db_citizen

@router.get("/phone/{phone}")
def read_citizen_by_phone(phone: str, db: Session = Depends(get_db)):
    db_citizen = crud.get_citizen_by_phone(db, phone=phone)
    if db_citizen is None:
        raise HTTPException(status_code=404, detail="Citizen not found")
    return db_citizen

@router.put("/{citizen_id}")
def update_citizen(citizen_id: str, updates: dict, db: Session = Depends(get_db)):
    db_citizen = crud.update_citizen(db, citizen_id=citizen_id, updates=updates)
    if db_citizen is None:
        raise HTTPException(status_code=404, detail="Citizen not found")
    return db_citizen

