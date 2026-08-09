from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

import crud, models, schemas
from database import get_db

router = APIRouter(prefix="/ai", tags=["ai"])

@router.get("/alerts", response_model=List[schemas.AIAlert])
def get_ai_alerts(citizenId: Optional[str] = None, db: Session = Depends(get_db)):
    return crud.get_ai_alerts(db, citizen_id=citizenId)

@router.get("/risk/{citizen_id}")
def get_ai_risk(citizen_id: str, db: Session = Depends(get_db)):
    citizen = crud.get_citizen_by_id(db, citizen_id)
    if not citizen:
        return {"risk_level": "Unknown", "score": 0}
    
    # Calculate a simple score logic to mock AI
    score = citizen.compliance_score if hasattr(citizen, "compliance_score") else 75
    return {
        "risk_level": citizen.payment_delay_risk,
        "score": score
    }
