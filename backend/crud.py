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
        "amount": outstanding,
        "daysOverdue": int(c.avg_days_late or 30),
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
        citizen = db.query(models.Citizen).filter(models.Citizen.id == t.citizen_id).first()
        citizen_name = citizen.name if citizen else f"Resident ({t.citizen_id})"
        c_num = "".join(filter(str.isdigit, t.citizen_id or "1")).zfill(4)
        prop_id = f"PROP-{t.ward_id or 'W01'}-{c_num}"
        result.append({
            "id": t.transaction_id,
            "transactionId": t.transaction_id,
            "citizenId": t.citizen_id,
            "citizenName": citizen_name,
            "propertyId": prop_id,
            "title": f"{t.tax_year or '2025-26'} Tax Payment",
            "taxType": "Property Tax" if "01" in (t.transaction_id or "") else "Municipal Tax",
            "date": str(t.date),
            "amount": float(t.amount),
            "method": t.payment_method,
            "paymentMethod": t.payment_method,
            "status": "PAID" if t.status in ["Success", "Paid"] else t.status,
            "receiptId": t.receipt_id or f"RCP{t.transaction_id}",
            "wardId": t.ward_id,
            "lateDays": t.late_days,
            "penaltyApplied": t.penalty_applied
        })
    return result

def get_recent_payments(db: Session, limit: int = 10):
    txns = db.query(models.Transaction).order_by(models.Transaction.date.desc(), models.Transaction.transaction_id.desc()).limit(limit).all()
    result = []
    for t in txns:
        citizen = db.query(models.Citizen).filter(models.Citizen.id == t.citizen_id).first()
        citizen_name = citizen.name if citizen else f"Resident ({t.citizen_id})"
        c_num = "".join(filter(str.isdigit, t.citizen_id or "1")).zfill(4)
        prop_id = f"PROP-{t.ward_id or 'W01'}-{c_num}"
        result.append({
            "id": t.transaction_id,
            "transactionId": t.transaction_id,
            "citizenId": t.citizen_id,
            "citizenName": citizen_name,
            "propertyId": prop_id,
            "taxType": "Property Tax" if "01" in (t.transaction_id or "") else "Municipal Tax",
            "amount": float(t.amount or 0),
            "paymentMethod": t.payment_method or "UPI",
            "method": t.payment_method or "UPI",
            "date": str(t.date or date.today()),
            "status": "PAID" if t.status in ["Success", "Paid"] else t.status,
            "receiptId": t.receipt_id or f"RCP{t.transaction_id}",
            "wardId": t.ward_id or "W01"
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
    # Lookup citizen by ID or Phone, with fallback for demo IDs
    citizen = db.query(models.Citizen).filter(
        (models.Citizen.id == payment.citizenId) | (models.Citizen.phone == payment.citizenId)
    ).first()
    
    if not citizen:
        citizen = db.query(models.Citizen).filter(models.Citizen.outstanding_dues > 0).first() or db.query(models.Citizen).first()
    
    if not citizen:
        raise ValueError(f"Citizen with ID '{payment.citizenId}' not found.")
    
    current_dues = float(citizen.outstanding_dues if citizen.outstanding_dues is not None else 12000.0)
    tax_id = str(payment.taxId or "")
    
    if current_dues <= 0 or tax_id.endswith("-PAID"):
        raise ValueError("Payment rejected: This tax bill has already been paid and has zero outstanding dues.")
    
    annual_tax = float(citizen.annual_tax or 12000.0)
    
    # Calculate itemized bill amount based on payment request or taxId
    if payment.amount and float(payment.amount) > 0:
        amount = min(current_dues, float(payment.amount))
    elif tax_id.endswith("-01") or "property" in tax_id.lower():
        # Property tax portion (80% of current dues or full dues if low)
        amount = round(current_dues * 0.8) if current_dues > 2000 else current_dues
    else:
        # Water/Waste or full tax bill — clears remaining dues
        amount = current_dues
    
    amount = max(1.0, float(amount))
    
    txn_id = f"TXN{uuid.uuid4().hex[:6].upper()}"
    rcp_id = f"RCP{uuid.uuid4().hex[:6].upper()}"
    
    transaction = models.Transaction(
        transaction_id=txn_id,
        citizen_id=citizen.id,
        ward_id=citizen.ward_id or "W01",
        amount=amount,
        payment_method=payment.paymentMethod or "UPI One-Tap",
        status="Success",
        date=date.today(),
        tax_year="2025-26",
        late_days=0,
        penalty_applied=False,
        receipt_id=rcp_id
    )
    
    db.add(transaction)
    
    # Update citizen dues and status
    new_outstanding = max(0.0, current_dues - amount)
    citizen.amount_paid = float(citizen.amount_paid or 0) + amount
    citizen.outstanding_dues = new_outstanding
    citizen.last_payment_date = date.today()
    
    if new_outstanding <= 0:
        citizen.last_payment_status = "On-time"
        citizen.payment_delay_risk = "Low"
        citizen.rewards_earned = (citizen.rewards_earned or 0) + 1
    else:
        citizen.last_payment_status = "Delayed"
        citizen.payment_delay_risk = "Medium"
    
    # Update Ward metrics in PostgreSQL
    ward = db.query(models.Ward).filter(models.Ward.ward_id == citizen.ward_id).first()
    if ward:
        ward.total_collected = float(ward.total_collected or 0) + amount
        ward.total_outstanding = max(0.0, float(ward.total_outstanding or 0) - amount)
        if ward.total_annual_tax and ward.total_annual_tax > 0:
            ward.collection_rate_pct = round((ward.total_collected / ward.total_annual_tax) * 100.0, 1)
    
    db.commit()
    db.refresh(transaction)
    db.refresh(citizen)
    if ward:
        db.refresh(ward)
        
    return {
        "id": transaction.transaction_id,
        "transactionId": transaction.transaction_id,
        "citizenId": transaction.citizen_id,
        "amount": transaction.amount,
        "status": "Success",
        "receiptId": transaction.receipt_id,
        "remainingDues": new_outstanding,
        "date": str(transaction.date)
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
    txns = db.query(models.Transaction).all()
    total = len(txns) or 1
    
    upi_count = 0
    net_banking = 0
    card = 0
    offline = 0
    
    for t in txns:
        m = (t.payment_method or "").lower()
        if "upi" in m or "autopay" in m or "tap" in m:
            upi_count += 1
        elif "net" in m or "banking" in m or "bank" in m:
            net_banking += 1
        elif "card" in m or "credit" in m or "debit" in m:
            card += 1
        else:
            offline += 1

    return [
        { "label": "UPI / AutoPay", "pct": round((upi_count / total) * 100) },
        { "label": "Net banking", "pct": round((net_banking / total) * 100) },
        { "label": "Debit / credit card", "pct": round((card / total) * 100) },
        { "label": "UPI manual", "pct": 7 },
        { "label": "Counter (offline)", "pct": round((offline / total) * 100) },
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

