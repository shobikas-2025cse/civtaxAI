from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import date

class CitizenBase(BaseModel):
    name: str
    ward_id: str
    ward_name: str
    property_type: str
    property_area_sqft: int
    water_connection: str
    waste_service: str
    annual_tax: float
    amount_paid: float
    outstanding_dues: float
    previous_delays: int
    payment_plan: str
    autopay_enabled: str
    preferred_payment_method: str
    last_payment_status: str
    avg_days_late: float
    reminders_received: int
    rewards_earned: int
    penalty_history: float
    payment_delay_risk: str
    registration_date: date
    last_payment_date: Optional[date] = None
    email: str
    phone: str

class Citizen(CitizenBase):
    id: str

    class Config:
        from_attributes = True

class TransactionBase(BaseModel):
    citizen_id: str
    ward_id: str
    amount: float
    payment_method: str
    status: str
    date: date
    tax_year: str
    late_days: int
    penalty_applied: bool
    receipt_id: str

class Transaction(TransactionBase):
    transaction_id: str

    class Config:
        from_attributes = True

class WardBase(BaseModel):
    ward_name: str
    total_citizens: int
    total_annual_tax: float
    total_collected: float
    total_outstanding: float
    collection_rate_pct: float
    high_risk_count: int
    compliance_score: float
    rank: int

class Ward(WardBase):
    ward_id: str

    class Config:
        from_attributes = True

class AIAlertBase(BaseModel):
    citizen_id: str
    risk_level: str
    reason: str
    recommended_action: str

class AIAlert(AIAlertBase):
    id: str

    class Config:
        from_attributes = True

class MonthlyTrend(BaseModel):
    month: str
    target_collection: float
    actual_collection: float

    class Config:
        from_attributes = True

# Request Schemas
class PaymentRequest(BaseModel):
    citizenId: str
    taxId: str
    paymentMethod: str
