import json
import os
import sys
import pandas as pd
from datetime import datetime
from sqlalchemy.orm import Session
from dotenv import load_dotenv

# Load .env before importing database (which needs DATABASE_URL)
load_dotenv()

import database, models

# Initialize the database engine — creates tables if they don't exist
models.Base.metadata.create_all(bind=database.engine)

def parse_date(val):
    if val is None or pd.isna(val):
        return None
    if isinstance(val, datetime):
        return val.date()
    val_str = str(val).strip()
    if not val_str or val_str.lower() in ['nan', 'none', 'null']:
        return None
    try:
        return datetime.strptime(val_str, "%Y-%m-%d").date()
    except Exception:
        return None

def seed_data(db: Session, reset: bool = False):
    """
    Seed the database with initial data from JSON or CSV data files.
    """
    if reset:
        print("WARNING: Resetting existing database tables...")
        db.query(models.Transaction).delete()
        db.query(models.AIAlert).delete()
        db.query(models.Citizen).delete()
        db.query(models.Ward).delete()
        db.query(models.MonthlyTrend).delete()
        db.commit()
        print("All tables cleared.")
    elif db.query(models.Citizen).first():
        print("Database is already seeded. Use --reset to clear and re-seed.")
        return

    # 1. Try dataset JSON first
    dataset_path = os.getenv('DATASET_PATH')
    json_data = None
    
    if not dataset_path:
        for possible_path in [
            'civtax_dataset.json',
            'backend/civtax_dataset.json',
            'public/data/civtax_dataset.json',
            '../public/data/civtax_dataset.json',
            'c:/Users/Shobika/Documents/civtax_dataset.json'
        ]:
            if os.path.exists(possible_path):
                dataset_path = possible_path
                break

    if dataset_path and os.path.exists(dataset_path):
        print(f"Loading data from JSON: {dataset_path}")
        with open(dataset_path, 'r') as f:
            json_data = json.load(f)

    if json_data:
        # Seed Wards from JSON
        if 'ward_summary' in json_data:
            print(f"Seeding {len(json_data['ward_summary'])} wards from JSON...")
            for w_data in json_data['ward_summary']:
                db.add(models.Ward(
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
                ))

        # Seed Citizens from JSON
        if 'citizens' in json_data:
            print(f"Seeding {len(json_data['citizens'])} citizens from JSON...")
            for c_data in json_data['citizens']:
                reg_date = parse_date(c_data.get('Registration_Date'))
                last_pay_date = parse_date(c_data.get('Last_Payment_Date'))
                db.add(models.Citizen(
                    id=c_data.get('Citizen_ID'),
                    name=c_data.get('Name'),
                    ward_id=c_data.get('Ward_ID'),
                    ward_name=c_data.get('Ward_Name'),
                    property_type=c_data.get('Property_Type'),
                    property_area_sqft=c_data.get('Property_Area_sqft'),
                    water_connection=str(c_data.get('Water_Connection')) if c_data.get('Water_Connection') is not None else 'No',
                    waste_service=str(c_data.get('Waste_Service')) if c_data.get('Waste_Service') is not None else 'Yes',
                    annual_tax=c_data.get('Annual_Tax'),
                    amount_paid=c_data.get('Amount_Paid'),
                    outstanding_dues=c_data.get('Outstanding_Dues'),
                    previous_delays=c_data.get('Previous_Delays'),
                    payment_plan=c_data.get('Payment_Plan'),
                    autopay_enabled=str(c_data.get('AutoPay_Enabled')) if c_data.get('AutoPay_Enabled') is not None else 'No',
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
                    phone=str(c_data.get('Phone'))
                ))

        # Seed Transactions from JSON
        if 'transactions' in json_data:
            print(f"Seeding {len(json_data['transactions'])} transactions from JSON...")
            for t_data in json_data['transactions']:
                t_date = parse_date(t_data.get('Date'))
                db.add(models.Transaction(
                    transaction_id=t_data.get('Transaction_ID'),
                    citizen_id=t_data.get('Citizen_ID'),
                    ward_id=t_data.get('Ward_ID'),
                    amount=t_data.get('Amount'),
                    payment_method=t_data.get('Payment_Method'),
                    status=t_data.get('Status'),
                    date=t_date,
                    tax_year=t_data.get('Tax_Year'),
                    late_days=t_data.get('Late_Days'),
                    penalty_applied=bool(t_data.get('Penalty_Applied')),
                    receipt_id=t_data.get('Receipt_ID')
                ))

        # Seed AI Alerts from JSON
        if 'ai_alerts' in json_data:
            print(f"Seeding {len(json_data['ai_alerts'])} AI alerts from JSON...")
            for a_data in json_data['ai_alerts']:
                db.add(models.AIAlert(
                    id=a_data.get('Alert_ID', f"ALT{len(db.query(models.AIAlert).all()) + 1:04d}"),
                    citizen_id=a_data.get('Citizen_ID'),
                    risk_level=a_data.get('Risk_Level'),
                    reason=a_data.get('Reason'),
                    recommended_action=a_data.get('Recommended_Action')
                ))

        # Seed Monthly Trends from JSON
        if 'monthly_collection_trend' in json_data:
            print(f"Seeding {len(json_data['monthly_collection_trend'])} monthly trends from JSON...")
            for trend_data in json_data['monthly_collection_trend']:
                db.add(models.MonthlyTrend(
                    month=trend_data.get('Month'),
                    target_collection=trend_data.get('Target_Collection'),
                    actual_collection=trend_data.get('Actual_Collection')
                ))

    else:
        # Fallback: Load from CSV files in public/data/
        data_dir = None
        for candidate in ['public/data', '../public/data', './data']:
            if os.path.exists(candidate) and (os.path.exists(os.path.join(candidate, 'citizens.csv')) or os.path.exists(os.path.join(candidate, 'civtax_citizens.csv'))):
                data_dir = candidate
                break

        if not data_dir:
            print("Error: Could not find dataset JSON or CSV data directory.")
            return

        print(f"Loading data from CSV directory: {data_dir}")

        # Seed Wards from CSV
        wards_csv = os.path.join(data_dir, 'wards.csv')
        if not os.path.exists(wards_csv):
            wards_csv = os.path.join(data_dir, 'civtax_ward_summary.csv')
        if os.path.exists(wards_csv):
            df_wards = pd.read_csv(wards_csv)
            print(f"Seeding {len(df_wards)} wards from CSV...")
            for _, r in df_wards.iterrows():
                db.add(models.Ward(
                    ward_id=str(r['Ward_ID']),
                    ward_name=str(r['Ward_Name']),
                    total_citizens=int(r['Total_Citizens']),
                    total_annual_tax=float(r['Total_Annual_Tax']),
                    total_collected=float(r['Total_Collected']),
                    total_outstanding=float(r['Total_Outstanding']),
                    collection_rate_pct=float(r['Collection_Rate_pct']),
                    high_risk_count=int(r['High_Risk_Count']),
                    compliance_score=float(r['Compliance_Score']),
                    rank=int(r['Rank'])
                ))

        # Seed Citizens from CSV
        citizens_csv = os.path.join(data_dir, 'citizens.csv')
        if not os.path.exists(citizens_csv):
            citizens_csv = os.path.join(data_dir, 'civtax_citizens.csv')
        if os.path.exists(citizens_csv):
            df_citizens = pd.read_csv(citizens_csv)
            print(f"Seeding {len(df_citizens)} citizens from CSV...")
            for _, r in df_citizens.iterrows():
                db.add(models.Citizen(
                    id=str(r['Citizen_ID']),
                    name=str(r['Name']),
                    ward_id=str(r['Ward_ID']),
                    ward_name=str(r['Ward_Name']),
                    property_type=str(r['Property_Type']),
                    property_area_sqft=int(r['Property_Area_sqft']),
                    water_connection=str(r['Water_Connection']),
                    waste_service=str(r['Waste_Service']),
                    annual_tax=float(r['Annual_Tax']),
                    amount_paid=float(r['Amount_Paid']),
                    outstanding_dues=float(r['Outstanding_Dues']),
                    previous_delays=int(r['Previous_Delays']),
                    payment_plan=str(r['Payment_Plan']),
                    autopay_enabled=str(r['AutoPay_Enabled']),
                    preferred_payment_method=str(r['Preferred_Payment_Method']),
                    last_payment_status=str(r['Last_Payment_Status']),
                    avg_days_late=float(r['Avg_Days_Late']),
                    reminders_received=int(r['Reminders_Received']),
                    rewards_earned=int(r['Rewards_Earned']),
                    penalty_history=float(r['Penalty_History']),
                    payment_delay_risk=str(r['Payment_Delay_Risk']),
                    registration_date=parse_date(r['Registration_Date']),
                    last_payment_date=parse_date(r.get('Last_Payment_Date')),
                    email=str(r['Email']),
                    phone=str(r['Phone'])
                ))

        # Seed Transactions from CSV
        txns_csv = os.path.join(data_dir, 'transactions.csv')
        if not os.path.exists(txns_csv):
            txns_csv = os.path.join(data_dir, 'civtax_transactions.csv')
        if os.path.exists(txns_csv):
            df_txns = pd.read_csv(txns_csv)
            print(f"Seeding {len(df_txns)} transactions from CSV...")
            for idx, r in df_txns.iterrows():
                db.add(models.Transaction(
                    transaction_id=str(r['Transaction_ID']),
                    citizen_id=str(r['Citizen_ID']),
                    ward_id=str(r['Ward_ID']),
                    amount=float(r['Amount']),
                    payment_method=str(r['Payment_Method']),
                    status=str(r['Status']),
                    date=parse_date(r['Date']),
                    tax_year=str(r['Tax_Year']),
                    late_days=int(r['Late_Days']),
                    penalty_applied=bool(r['Penalty_Applied']),
                    receipt_id=str(r['Receipt_ID'])
                ))

        # Seed AI Alerts from CSV
        alerts_csv = os.path.join(data_dir, 'alerts.csv')
        if not os.path.exists(alerts_csv):
            alerts_csv = os.path.join(data_dir, 'civtax_ai_alerts.csv')
        if os.path.exists(alerts_csv):
            df_alerts = pd.read_csv(alerts_csv)
            print(f"Seeding {len(df_alerts)} AI alerts from CSV...")
            for idx, r in df_alerts.iterrows():
                risk = str(r['Risk_Level']) if 'Risk_Level' in r and pd.notna(r['Risk_Level']) else str(r.get('Priority', 'High'))
                reason = str(r['Reason']) if 'Reason' in r and pd.notna(r['Reason']) else str(r.get('Alert_Type', 'Payment Overdue'))
                action = str(r['Recommended_Action']) if 'Recommended_Action' in r and pd.notna(r['Recommended_Action']) else 'Send Reminder'
                db.add(models.AIAlert(
                    id=str(r.get('Alert_ID', f"ALT{idx + 1:04d}")),
                    citizen_id=str(r['Citizen_ID']),
                    risk_level=risk,
                    reason=reason,
                    recommended_action=action
                ))

        # Seed Monthly Trends from CSV
        trends_csv = os.path.join(data_dir, 'monthly_trend.csv')
        if not os.path.exists(trends_csv):
            trends_csv = os.path.join(data_dir, 'civtax_monthly_trend.csv')
        if os.path.exists(trends_csv):
            df_trends = pd.read_csv(trends_csv)
            print(f"Seeding {len(df_trends)} monthly trends from CSV...")
            for _, r in df_trends.iterrows():
                target_val = float(r['Target']) if 'Target' in r else float(r.get('Target_Collection', 0))
                actual_val = float(r['Collected']) if 'Collected' in r else float(r.get('Actual_Collection', 0))
                db.add(models.MonthlyTrend(
                    month=str(r['Month']),
                    target_collection=target_val,
                    actual_collection=actual_val
                ))

    db.commit()
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    reset_flag = '--reset' in sys.argv
    if reset_flag:
        print("Reset flag detected — will clear all tables before seeding.")
    
    db = database.SessionLocal()
    try:
        seed_data(db, reset=reset_flag)
    finally:
        db.close()
