import json
import os
from sqlalchemy.orm import Session
import database, models
from datetime import datetime

# Initialize the database engine
models.Base.metadata.create_all(bind=database.engine)

def seed_data(db: Session, reset: bool = True):
    if reset:
        print("Resetting existing database tables...")
        db.query(models.Transaction).delete()
        db.query(models.AIAlert).delete()
        db.query(models.Citizen).delete()
        db.query(models.Ward).delete()
        db.query(models.MonthlyTrend).delete()
        db.commit()
    elif db.query(models.Citizen).first():
        print("Database is already seeded.")
        return

    # Load JSON data
    dataset_path = 'c:/Users/Shobika/Documents/civtax_dataset.json'
    
    if not os.path.exists(dataset_path):
        print(f"Dataset not found at {dataset_path}")
        return

    print("Loading data from dataset...")
    with open(dataset_path, 'r') as f:
        data = json.load(f)

    # 1. Seed Wards
    if 'ward_summary' in data:
        print(f"Seeding {len(data['ward_summary'])} wards...")
        for w_data in data['ward_summary']:
            ward = models.Ward(
                ward_id=w_data.get('Ward_ID'),
                ward_name=w_data.get('Ward_Name'),
                total_citizens=w_data.get('Total_Citizens'),
                total_annual_tax=w_data.get('Total_Annual_Tax'),
                total_collected=w_data.get('Total_Collected'),
                total_outstanding=w_data.get('Total_Outstanding'),
                collection_rate_pct=w_data.get('Collection_Rate_pct'),
                high_risk_count=w_data.get('High_Risk_Count'),
                compliance_score=w_data.get('Compliance_Score'),
                rank=w_data.get('Rank')
            )
            db.add(ward)

    # 2. Seed Citizens
    if 'citizens' in data:
        print(f"Seeding {len(data['citizens'])} citizens...")
        for c_data in data['citizens']:
            # Parse dates
            reg_date = c_data.get('Registration_Date')
            last_pay_date = c_data.get('Last_Payment_Date')
            
            reg_date = datetime.strptime(reg_date, "%Y-%m-%d").date() if reg_date else None
            last_pay_date = datetime.strptime(last_pay_date, "%Y-%m-%d").date() if last_pay_date else None
            
            citizen = models.Citizen(
                id=c_data.get('Citizen_ID'),
                name=c_data.get('Name'),
                ward_id=c_data.get('Ward_ID'),
                ward_name=c_data.get('Ward_Name'),
                property_type=c_data.get('Property_Type'),
                property_area_sqft=c_data.get('Property_Area_sqft'),
                water_connection=c_data.get('Water_Connection'),
                waste_service=c_data.get('Waste_Service'),
                annual_tax=c_data.get('Annual_Tax'),
                amount_paid=c_data.get('Amount_Paid'),
                outstanding_dues=c_data.get('Outstanding_Dues'),
                previous_delays=c_data.get('Previous_Delays'),
                payment_plan=c_data.get('Payment_Plan'),
                autopay_enabled=c_data.get('AutoPay_Enabled'),
                preferred_payment_method=c_data.get('Preferred_Payment_Method'),
                last_payment_status=c_data.get('Last_Payment_Status'),
                avg_days_late=c_data.get('Avg_Days_Late'),
                reminders_received=c_data.get('Reminders_Received'),
                rewards_earned=c_data.get('Rewards_Earned'),
                penalty_history=c_data.get('Penalty_History'),
                payment_delay_risk=c_data.get('Payment_Delay_Risk'),
                registration_date=reg_date,
                last_payment_date=last_pay_date,
                email=c_data.get('Email'),
                phone=c_data.get('Phone')
            )
            db.add(citizen)

    # 3. Seed Transactions
    if 'transactions' in data:
        print(f"Seeding {len(data['transactions'])} transactions...")
        for t_data in data['transactions']:
            t_date = t_data.get('Date')
            t_date = datetime.strptime(t_date, "%Y-%m-%d").date() if t_date else None
            
            transaction = models.Transaction(
                transaction_id=t_data.get('Transaction_ID'),
                citizen_id=t_data.get('Citizen_ID'),
                ward_id=t_data.get('Ward_ID'),
                amount=t_data.get('Amount'),
                payment_method=t_data.get('Payment_Method'),
                status=t_data.get('Status'),
                date=t_date,
                tax_year=t_data.get('Tax_Year'),
                late_days=t_data.get('Late_Days'),
                penalty_applied=t_data.get('Penalty_Applied'),
                receipt_id=t_data.get('Receipt_ID')
            )
            db.add(transaction)

    # 4. Seed AI Alerts
    if 'ai_alerts' in data:
        print(f"Seeding {len(data['ai_alerts'])} AI alerts...")
        for a_data in data['ai_alerts']:
            alert = models.AIAlert(
                id=a_data.get('Alert_ID', f"ALT{len(db.query(models.AIAlert).all()) + 1:04d}"),
                citizen_id=a_data.get('Citizen_ID'),
                risk_level=a_data.get('Risk_Level'),
                reason=a_data.get('Reason'),
                recommended_action=a_data.get('Recommended_Action')
            )
            db.add(alert)
            
    # 5. Seed Monthly Trends
    if 'monthly_collection_trend' in data:
        print(f"Seeding {len(data['monthly_collection_trend'])} monthly trends...")
        for trend_data in data['monthly_collection_trend']:
            trend = models.MonthlyTrend(
                month=trend_data.get('Month'),
                target_collection=trend_data.get('Target_Collection'),
                actual_collection=trend_data.get('Actual_Collection')
            )
            db.add(trend)

    db.commit()
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    db = database.SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
