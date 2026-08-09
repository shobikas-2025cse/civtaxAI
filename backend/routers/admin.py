from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Any

import crud, models, schemas
from database import get_db

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/metrics")
def get_admin_metrics(db: Session = Depends(get_db)):
    return crud.get_summary(db)

@router.get("/wards")
def get_wards(db: Session = Depends(get_db)):
    return crud.get_all_wards(db)

@router.get("/officers")
def get_officers(db: Session = Depends(get_db)):
    return [
        { "id": "O001", "name": "Karthik Subbaiah", "ward": "Ward 2, Ward 4, Ward 5", "role": "Senior Collector", "active": True },
        { "id": "O002", "name": "Divya Nair", "ward": "Ward 1, Ward 3, Ward 7", "role": "Field Collector", "active": True },
        { "id": "O003", "name": "Arjun Pillai", "ward": "Ward 6, Ward 8", "role": "Junior Collector", "active": False },
    ]

@router.get("/roles")
def get_roles(db: Session = Depends(get_db)):
    return [
        { "name": "System Admin", "perms": ["Full System Access", "Config", "Users", "Reports", "Audit Logs"] },
        { "name": "Tax Collector", "perms": ["View Citizens", "Record Payment", "Generate Notice", "View Ward Report"] },
        { "name": "Auditor", "perms": ["View All Reports", "Audit Logs", "Export Data"] },
        { "name": "Citizen", "perms": ["View Own Bills", "Pay Tax", "Download Receipts", "View Rewards"] },
    ]

@router.get("/logs")
def get_activity_logs(db: Session = Depends(get_db)):
    return [
        { "type": "config", "msg": "Tax Rules updated by Admin · Property rate 1.5% active", "time": "2m ago", "color": "text-amber-400" },
        { "type": "payment", "msg": "Rekha Menon (C001) paid ₹13,800 — Ward 02 · Auto-confirmed", "time": "12m ago", "color": "text-green-400" },
        { "type": "alert", "msg": "Anil Reddy (C003) flagged High Risk (Overdue ₹8,300)", "time": "45m ago", "color": "text-red-400" },
        { "type": "officer", "msg": "Officer Divya Nair logged in · Bangalore Municipal Zone", "time": "2h ago", "color": "text-blue-400" },
        { "type": "reward", "msg": "Lakshmi Pillai (C002) awarded Gold Model Citizen badge", "time": "3h ago", "color": "text-purple-400" },
        { "type": "config", "msg": "Early Bird Discount (5%) synchronized across 8 wards", "time": "5h ago", "color": "text-amber-400" },
    ]

@router.get("/trends")
def get_admin_trends(db: Session = Depends(get_db)):
    return crud.get_monthly_trends(db)

