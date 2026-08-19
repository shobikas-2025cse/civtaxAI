from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Any

import crud, models, schemas
from database import get_db

router = APIRouter(tags=["taxes"])

@router.get("/taxes/citizen/{citizen_id}")
def read_tax_summary(citizen_id: str, db: Session = Depends(get_db)):
    taxes = crud.get_citizen_taxes(db, citizen_id=citizen_id)
    return taxes

@router.get("/transactions")
def read_transactions(citizenId: Optional[str] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_transactions_by_citizen(db, citizen_id=citizenId, skip=skip, limit=limit)

@router.post("/taxes/pay")
def pay_tax(payment: schemas.PaymentRequest, db: Session = Depends(get_db)):
    try:
        transaction = crud.create_payment(db, payment=payment)
        if not transaction:
            raise HTTPException(status_code=400, detail="Payment processing failed")
        return transaction
    except ValueError as ve:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error during payment processing: {str(e)}")


@router.get("/summary")
def get_tax_summary(db: Session = Depends(get_db)):
    return crud.get_summary(db)

@router.get("/trends/monthly")
def get_monthly_trends(db: Session = Depends(get_db)):
    return crud.get_monthly_trends(db)

