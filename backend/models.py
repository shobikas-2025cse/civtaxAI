from sqlalchemy import Column, String, Integer, Float, Boolean, Date, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base

class Citizen(Base):
    __tablename__ = "citizens"
    
    id = Column(String, primary_key=True, index=True) # Citizen_ID
    name = Column(String, index=True)
    ward_id = Column(String, index=True)
    ward_name = Column(String)
    property_type = Column(String)
    property_area_sqft = Column(Integer)
    water_connection = Column(String)
    waste_service = Column(String)
    annual_tax = Column(Float)
    amount_paid = Column(Float)
    outstanding_dues = Column(Float)
    previous_delays = Column(Integer)
    payment_plan = Column(String)
    autopay_enabled = Column(String)
    preferred_payment_method = Column(String)
    last_payment_status = Column(String)
    avg_days_late = Column(Float)
    reminders_received = Column(Integer)
    rewards_earned = Column(Integer)
    penalty_history = Column(Float)
    payment_delay_risk = Column(String)
    registration_date = Column(Date)
    last_payment_date = Column(Date, nullable=True)
    email = Column(String)
    phone = Column(String, index=True)
    
    transactions = relationship("Transaction", back_populates="citizen")
    ai_alerts = relationship("AIAlert", back_populates="citizen")


class Transaction(Base):
    __tablename__ = "transactions"
    
    transaction_id = Column(String, primary_key=True, index=True)
    citizen_id = Column(String, ForeignKey("citizens.id"))
    ward_id = Column(String)
    amount = Column(Float)
    payment_method = Column(String)
    status = Column(String)
    date = Column(Date)
    tax_year = Column(String)
    late_days = Column(Integer)
    penalty_applied = Column(Boolean)
    receipt_id = Column(String)
    
    citizen = relationship("Citizen", back_populates="transactions")


class Ward(Base):
    __tablename__ = "wards"
    
    ward_id = Column(String, primary_key=True, index=True)
    ward_name = Column(String)
    total_citizens = Column(Integer)
    total_annual_tax = Column(Float)
    total_collected = Column(Float)
    total_outstanding = Column(Float)
    collection_rate_pct = Column(Float)
    high_risk_count = Column(Integer)
    compliance_score = Column(Float)
    rank = Column(Integer)


class AIAlert(Base):
    __tablename__ = "ai_alerts"
    
    id = Column(String, primary_key=True, index=True)
    citizen_id = Column(String, ForeignKey("citizens.id"))
    risk_level = Column(String)
    reason = Column(String)
    recommended_action = Column(String)
    
    citizen = relationship("Citizen", back_populates="ai_alerts")


class MonthlyTrend(Base):
    __tablename__ = "monthly_trends"
    
    month = Column(String, primary_key=True, index=True)
    target_collection = Column(Float)
    actual_collection = Column(Float)
