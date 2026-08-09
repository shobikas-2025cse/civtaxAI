from sqlalchemy.orm import Session
from sqlalchemy import func
import models, schemas
import uuid
from datetime import date, datetime

def format_citizen(c: models.Citizen) -> dict:
    if not c:
        return None
    
    annual_tax = float(c.annual_tax or 12000)
    amount_paid = float(c.amount_paid or 0)
    outstanding = float(c.outstanding_dues if c.outstanding_dues is not None else max(0, annual_tax - amount_paid))
    delay_risk = c.payment_delay_risk or ("High" if outstanding > 0 else "Low")
    is_defaulter = delay_risk == "High" or outstanding > 0 or c.last_payment_status == "Defaulted"
    
    # Calculate CRED-style Civic Score (300 to 900)
    if delay_risk == "Low":
        civic_score = 840
    elif delay_risk == "Medium":
        civic_score = 680
    else:
        civic_score = 520 if is_defaulter else 640
        
    streak = (int(c.rewards_earned or 0) * 2 + 1) if c.rewards_earned else (0 if is_defaulter else 3)
    xp = 1500 + streak * 250 + (800 if annual_tax > 20000 else 300)
    
    c_num = "".join(filter(str.isdigit, c.id or "1")).zfill(4)
    property_id = f"PROP-{c.ward_id or 'W01'}-{c_num}"
    
    return {
        "id": c.id,
        "Citizen_ID": c.id,
        "name": c.name,
        "phone": str(c.phone or ""),
        "email": c.email or f"{c.id.lower()}@civtax.in",
        "ward": f"{c.ward_id or 'W01'} - {c.ward_name or 'Central'}",
        "wardId": c.ward_id or "W01",
        "wardName": c.ward_name or "Central",
        "propertyId": property_id,
        "propertyType": c.property_type or "Residential",
        "propertyArea": c.property_area_sqft or 2400,
        "waterConnection": c.water_connection in ["Yes", True, "true"],
        "wasteService": c.waste_service in ["Yes", True, "true"],
        "annualTax": annual_tax,
        "amountPaid": amount_paid,
        "outstandingDues": outstanding,
        "status": "Defaulter" if is_defaulter else "Compliant",
        "riskCategory": "High Risk" if delay_risk == "High" else ("Moderate Risk" if delay_risk == "Medium" else "Low Risk"),
        "riskScore": 82 if delay_risk == "High" else (54 if delay_risk == "Medium" else 18),
        "civicCreditScore": civic_score,
        "civicCreditTier": "Excellent (Top 2% Taxpayer)" if civic_score >= 800 else ("Good Civic Standing" if civic_score >= 650 else "Needs Immediate Attention"),
        "tier": "Gold Model Citizen 🌟" if civic_score >= 800 else ("Silver Tier" if civic_score >= 650 else "Action Required 🚨"),
        "xp": xp,
        "level": max(1, xp // 400),
        "streak": streak,
        "paymentPlan": c.payment_plan or "Quarterly",
        "autoPayEnabled": c.autopay_enabled in ["Yes", True, "true"],
        "preferredPaymentMethod": c.preferred_payment_method or "UPI",
        "lastPaymentStatus": c.last_payment_status or "On-time",
        "lastPaymentDate": str(c.last_payment_date) if c.last_payment_date else "2024-09-08",
        "registrationDate": str(c.registration_date) if c.registration_date else "2023-09-01",
        "avgDaysLate": float(c.avg_days_late or 0),
        "remindersReceived": int(c.reminders_received or 0),
        "rewardsEarned": int(c.rewards_earned or 0),
        "penaltyHistory": float(c.penalty_history or 0),
        "badges": [
            { "id": "early_bird", "name": "Early Bird", "desc": "Paid 7 days before due date", "icon": "⚡", "unlocked": streak >= 2 },
            { "id": "digital_champ", "name": "Digital Champion", "desc": "Used online UPI/Net Banking", "icon": "💳", "unlocked": True },
            { "id": "green_citizen", "name": "Green Citizen", "desc": "Zero paper notices received", "icon": "🌱", "unlocked": int(c.reminders_received or 0) == 0 },
            { "id": "top_tier", "name": "Top 1% Citizen", "desc": "Civic Score > 800", "icon": "👑", "unlocked": civic_score >= 800 }
        ]
    }

def get_citizen_by_id(db: Session, citizen_id: str):
    c = db.query(models.Citizen).filter(models.Citizen.id == citizen_id).first()
    return format_citizen(c)

def get_citizen_by_phone(db: Session, phone: str):
    c = db.query(models.Citizen).filter(models.Citizen.phone == phone).first()
    return format_citizen(c)

def get_citizens(db: Session, skip: int = 0, limit: int = 100):
    citizens = db.query(models.Citizen).offset(skip).limit(limit).all()
    return [format_citizen(c) for c in citizens]

def update_citizen(db: Session, citizen_id: str, updates: dict):
    citizen = db.query(models.Citizen).filter(models.Citizen.id == citizen_id).first()
    if citizen:
        for key, value in updates.items():
            if hasattr(citizen, key):
                setattr(citizen, key, value)
        db.commit()
        db.refresh(citizen)
        return format_citizen(citizen)
    return None

def get_leaderboard(db: Session, limit: int = 5):
    citizens = db.query(models.Citizen).all()
    formatted = [format_citizen(c) for c in citizens]
    formatted.sort(key=lambda x: (x["civicCreditScore"], x["xp"]), reverse=True)
    return formatted[:limit]

def get_transactions_by_citizen(db: Session, citizen_id: str = None, skip: int = 0, limit: int = 100):
    query = db.query(models.Transaction)
    if citizen_id:
        query = query.filter(models.Transaction.citizen_id == citizen_id)
    txns = query.order_by(models.Transaction.date.desc()).offset(skip).limit(limit).all()
    
    result = []
    for t in txns:
        result.append({
            "id": t.transaction_id,
            "Transaction_ID": t.transaction_id,
            "title": f"{t.tax_year or '2023-24'} Tax Payment",
            "date": str(t.date),
            "amount": float(t.amount),
            "method": t.payment_method,
            "paymentMethod": t.payment_method,
            "status": "Paid" if t.status in ["Success", "Paid"] else t.status,
            "receiptId": t.receipt_id or f"RCP{t.transaction_id}",
            "citizenId": t.citizen_id,
            "wardId": t.ward_id,
            "lateDays": t.late_days,
            "penaltyApplied": t.penalty_applied
        })
    return result

def get_citizen_taxes(db: Session, citizen_id: str):
    c = db.query(models.Citizen).filter(models.Citizen.id == citizen_id).first()
    if not c:
        return []
        
    annual_tax = float(c.annual_tax or 12000)
    amount_paid = float(c.amount_paid or 0)
    outstanding = float(c.outstanding_dues if c.outstanding_dues is not None else max(0, annual_tax - amount_paid))
    has_overdue = c.payment_delay_risk == "High" or c.last_payment_status == "Defaulted"
    
    items = []
    if outstanding > 0:
        if has_overdue:
            items.append({
                "id": f"TAX-{c.id}-01",
                "type": "Property Tax",
                "amount": round(outstanding * 0.8),
                "due": "2026-06-01",
                "status": "overdue",
                "period": "Q2 2026",
                "daysUntilDue": -25,
                "arrears": round(outstanding * 0.08)
            })
            items.append({
                "id": f"TAX-{c.id}-02",
                "type": "Water Tax",
                "amount": round(outstanding * 0.2),
                "due": "2026-08-30",
                "status": "pending",
                "period": "Aug 2026",
                "daysUntilDue": 22
            })
        else:
            items.append({
                "id": f"TAX-{c.id}-01",
                "type": "Property Tax",
                "amount": round(outstanding),
                "due": "2026-09-15",
                "status": "pending",
                "period": "Q3 2026",
                "daysUntilDue": 38
            })
    else:
        items.append({
            "id": f"TAX-{c.id}-PAID",
            "type": "Property Tax (Annual)",
            "amount": annual_tax,
            "due": str(c.last_payment_date or "2024-09-08"),
            "status": "paid",
            "period": "FY 2023-24",
            "paidOn": str(c.last_payment_date or "2024-09-08")
        })
    return items

def create_payment(db: Session, payment: schemas.PaymentRequest):
    citizen = db.query(models.Citizen).filter(models.Citizen.id == payment.citizenId).first()
    if not citizen:
        return None
    
    current_dues = float(citizen.outstanding_dues or 0)
    tax_id = str(payment.taxId or "")
    
    # Calculate itemized bill amount based on taxId
    if tax_id.endswith("-02") or "water" in tax_id.lower():
        # Water Tax bill is 20% of outstanding dues
        amount = round(current_dues * 0.2) if current_dues > 0 else 1800.0
    elif tax_id.endswith("-01") or "property" in tax_id.lower():
        # Property Tax bill is 80% of outstanding dues (or all remaining)
        amount = round(current_dues * 0.8) if current_dues > 0 else float(citizen.annual_tax or 5000.0)
    else:
        # Total Dues payment
        amount = current_dues if current_dues > 0 else float(citizen.annual_tax or 5000.0)
    
    amount = max(100.0, float(amount))
    
    transaction = models.Transaction(
        transaction_id=f"TXN{uuid.uuid4().hex[:6].upper()}",
        citizen_id=citizen.id,
        ward_id=citizen.ward_id,
        amount=amount,
        payment_method=payment.paymentMethod,
        status="Success",
        date=date.today(),
        tax_year="2023-24",
        late_days=0,
        penalty_applied=False,
        receipt_id=f"RCP{uuid.uuid4().hex[:6].upper()}"
    )
    
    db.add(transaction)
    
    # Update citizen dues and status
    new_outstanding = max(0.0, current_dues - amount)
    citizen.amount_paid = (citizen.amount_paid or 0) + amount
    citizen.outstanding_dues = new_outstanding
    citizen.last_payment_date = date.today()
    
    if new_outstanding == 0:
        citizen.last_payment_status = "On-time"
        citizen.payment_delay_risk = "Low"
        citizen.rewards_earned = (citizen.rewards_earned or 0) + 1
    
    db.commit()
    db.refresh(transaction)
    return {
        "id": transaction.transaction_id,
        "transactionId": transaction.transaction_id,
        "citizenId": transaction.citizen_id,
        "amount": transaction.amount,
        "status": "Success",
        "receiptId": transaction.receipt_id,
        "remainingDues": new_outstanding
    }

def get_all_wards(db: Session):
    raw_wards = db.query(models.Ward).order_by(models.Ward.rank).all()
    officer_map = {
        'W01': 'Divya Nair',
        'W02': 'Karthik Subbaiah',
        'W03': 'Divya Nair',
        'W04': 'Karthik Subbaiah',
        'W05': 'Karthik Subbaiah',
        'W06': 'Arjun Pillai',
        'W07': 'Divya Nair',
        'W08': 'Arjun Pillai'
    }
    
    result = []
    for w in raw_wards:
        rate = float(w.collection_rate_pct or 60.0)
        rank = int(w.rank or 1)
        result.append({
            "code": w.ward_id,
            "id": w.ward_id,
            "name": f"{w.ward_id} - {w.ward_name}",
            "wardName": w.ward_name,
            "population": int(w.total_citizens or 35) * 450,
            "officer": officer_map.get(w.ward_id, "Karthik Subbaiah"),
            "totalCitizens": int(w.total_citizens or 35),
            "totalAnnualTax": float(w.total_annual_tax or 650000),
            "totalCollected": float(w.total_collected or 440000),
            "totalOutstanding": float(w.total_outstanding or 210000),
            "rate": rate,
            "collectionEfficiency": rate,
            "highRiskCount": int(w.high_risk_count or 20),
            "complianceScore": float(w.compliance_score or 40.0),
            "rank": rank,
            "status": "Green Zone" if rate >= 65 else ("Yellow Zone" if rate >= 55 else "Red Risk Zone"),
            "color": "border-green-500 bg-green-500/10 text-green-400" if rate >= 65 else ("border-mustard bg-mustard/10 text-mustard" if rate >= 55 else "border-red-500 bg-red-500/10 text-red-400"),
            "badge": "Green Leader" if rank <= 2 else ("Silver Ward" if rank <= 4 else "Intervention Needed"),
            "complianceStatus": "Top Performing Ward 🏆" if rank <= 2 else ("High Growth 🚀" if rank <= 4 else "Action Required 🚨"),
            "streakMonths": max(1, 10 - rank)
        })
    return result

def get_summary(db: Session):
    total_collected = db.query(func.sum(models.Ward.total_collected)).scalar() or 3242800.0
    total_target = db.query(func.sum(models.Ward.total_annual_tax)).scalar() or 5338700.0
    total_outstanding = db.query(func.sum(models.Ward.total_outstanding)).scalar() or 2095900.0
    
    total_citizens = db.query(func.count(models.Citizen.id)).scalar() or 300
    defaulters = db.query(func.count(models.Citizen.id)).filter(models.Citizen.outstanding_dues > 0).scalar() or 200
    auto_pay = db.query(func.count(models.Citizen.id)).filter(models.Citizen.autopay_enabled.in_(["Yes", "true", True])).scalar() or 132
    txns = db.query(func.count(models.Transaction.transaction_id)).scalar() or 500
    
    collection_rate = round((total_collected / total_target * 100), 1) if total_target > 0 else 60.7
    
    return {
        "totalCollected": total_collected,
        "totalPending": total_outstanding,
        "totalOverdue": round(total_outstanding * 0.7),
        "collectionRate": collection_rate,
        "complianceRate": collection_rate,
        "totalCitizens": total_citizens,
        "totalTransactions": txns,
        "totalAnnualTax": total_target,
        "autoPayEnrolled": auto_pay,
        "highRiskCitizens": defaulters,
        "defaulters": defaulters
    }

def get_collector_metrics(db: Session):
    s = get_summary(db)
    total_collected_amt = float(s["totalCollected"])
    total_pending_amt = float(s["totalPending"])
    
    total_collected_str = f"{(total_collected_amt / 10000000):.2f} Cr" if total_collected_amt >= 10000000 else f"{(total_collected_amt / 100000):.1f} Lakhs"
    total_pending_str = f"{(total_pending_amt / 10000000):.2f} Cr" if total_pending_amt >= 10000000 else f"{(total_pending_amt / 100000):.1f} Lakhs"
    
    return {
        "totalCollected": total_collected_str,
        "totalCollectedAmount": total_collected_amt,
        "complianceRate": s["complianceRate"],
        "pendingDues": total_pending_str,
        "pendingDuesAmount": total_pending_amt,
        "autoPayEnrolled": s["autoPayEnrolled"],
        "totalCitizens": s["totalCitizens"],
        "highRiskCount": s["highRiskCitizens"],
        "totalTransactions": s["totalTransactions"]
    }

def get_collector_stages(db: Session):
    total = db.query(func.count(models.Citizen.id)).scalar() or 300
    on_time = db.query(func.count(models.Citizen.id)).filter(models.Citizen.last_payment_status == "On-time").scalar() or 174
    delayed = db.query(func.count(models.Citizen.id)).filter(models.Citizen.last_payment_status == "Delayed").scalar() or 45
    high_risk = db.query(func.count(models.Citizen.id)).filter(models.Citizen.payment_delay_risk == "High").scalar() or 90
    defaulted = db.query(func.count(models.Citizen.id)).filter(models.Citizen.last_payment_status == "Defaulted").scalar() or 81
    
    return [
        { "label": "Paid on time", "pct": round((on_time / total) * 100) if total else 58, "barColor": "#22c55e" },
        { "label": "Paid late", "pct": round((delayed / total) * 100) if total else 15, "barColor": "#eab308" },
        { "label": "30-day overdue", "pct": round((high_risk / total) * 0.4 * 100) if total else 12, "barColor": "#f97316" },
        { "label": "60-day (penalty)", "pct": round((defaulted / total) * 0.6 * 100) if total else 9, "barColor": "#ef4444" },
        { "label": "90-day (frozen)", "pct": round((defaulted / total) * 0.4 * 100) if total else 6, "barColor": "#991b1b" },
    ]

def get_collector_payment_methods(db: Session):
    total = db.query(func.count(models.Transaction.transaction_id)).scalar() or 500
    methods = db.query(models.Transaction.payment_method, func.count(models.Transaction.transaction_id)).group_by(models.Transaction.payment_method).all()
    count_map = {m: c for m, c in methods}
    
    upi_count = count_map.get("UPI", 240)
    net_banking = count_map.get("Net Banking", 145)
    card = count_map.get("Credit Card", 35) + count_map.get("Debit Card", 35)
    offline = count_map.get("Offline", 10) + count_map.get("Cash", 10)
    
    return [
        { "label": "UPI / AutoPay", "pct": round((upi_count / total) * 100) if total else 48 },
        { "label": "Net banking", "pct": round((net_banking / total) * 100) if total else 29 },
        { "label": "Debit / credit card", "pct": round((card / total) * 100) if total else 14 },
        { "label": "UPI manual", "pct": 7 },
        { "label": "Counter (offline)", "pct": round((offline / total) * 100) if total else 2 },
    ]

def get_ai_alerts(db: Session, citizen_id: str = None):
    query = db.query(models.AIAlert)
    if citizen_id:
        query = query.filter(models.AIAlert.citizen_id == citizen_id)
    alerts = query.all()
    return [{
        "id": a.id,
        "Alert_ID": a.id,
        "citizenId": a.citizen_id,
        "Citizen_ID": a.citizen_id,
        "riskLevel": a.risk_level,
        "Risk_Level": a.risk_level,
        "reason": a.reason,
        "Reason": a.reason,
        "recommendedAction": a.recommended_action,
        "Recommended_Action": a.recommended_action
    } for a in alerts]

def get_monthly_trends(db: Session):
    trends = db.query(models.MonthlyTrend).all()
    if not trends:
        return [
            { "month": "Apr", "actual": 28.5, "target": 35.0, "lastYear": 24.0 },
            { "month": "May", "actual": 32.1, "target": 35.0, "lastYear": 26.5 },
            { "month": "Jun", "actual": 41.0, "target": 40.0, "lastYear": 31.0 },
            { "month": "Jul", "actual": 38.4, "target": 40.0, "lastYear": 33.2 },
            { "month": "Aug", "actual": 45.2, "target": 45.0, "lastYear": 36.0 },
            { "month": "Sep", "actual": 52.8, "target": 50.0, "lastYear": 40.1 },
            { "month": "Oct", "actual": 48.0, "target": 50.0, "lastYear": 42.0 },
            { "month": "Nov", "actual": 55.3, "target": 55.0, "lastYear": 44.5 },
        ]
    return [
        {
            "month": t.month,
            "actual": float(t.actual_collection or 0),
            "target": float(t.target_collection or 0),
            "lastYear": round(float(t.actual_collection or 0) * 0.85, 1)
        }
        for t in trends
    ]

