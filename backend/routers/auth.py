import os
import re
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from database import get_db
import crud

try:
    from twilio.rest import Client
    from twilio.base.exceptions import TwilioRestException
    TWILIO_AVAILABLE = True
except ImportError:
    TWILIO_AVAILABLE = False

router = APIRouter(prefix="/auth", tags=["auth"])

class SendOTPRequest(BaseModel):
    phone: str = Field(..., description="10-digit mobile number or E.164 formatted phone number")

class VerifyOTPRequest(BaseModel):
    phone: str = Field(..., description="Mobile number")
    code: str = Field(..., description="6-digit OTP code")

def format_e164_phone(phone: str, default_country_code: str = "+91") -> str:
    """
    Validates and formats input mobile number to E.164 standard (+91XXXXXXXXXX).
    """
    if not phone or not str(phone).strip():
        raise ValueError("Mobile number is required.")
    
    raw = str(phone).strip()
    cleaned = re.sub(r"[^\d+]", "", raw)
    
    if cleaned.startswith("+"):
        digits = cleaned[1:]
        if len(digits) < 10 or len(digits) > 15:
            raise ValueError("Invalid phone number length. Must be between 10 and 15 digits.")
        return cleaned
    
    digits_only = re.sub(r"\D", "", cleaned)
    
    if len(digits_only) == 10:
        return f"{default_country_code}{digits_only}"
    elif len(digits_only) == 12 and digits_only.startswith("91"):
        return f"+{digits_only}"
    elif 11 <= len(digits_only) <= 15:
        return f"+{digits_only}"
    else:
        raise ValueError("Please enter a valid 10-digit mobile number.")

@router.post("/send-otp")
def send_otp(req: SendOTPRequest):
    """
    Triggers Demo OTP (123456) with optional Twilio SMS delivery if configured.
    """
    try:
        formatted_phone = format_e164_phone(req.phone)
    except ValueError as err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(err))

    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    verify_sid = os.getenv("TWILIO_VERIFY_SERVICE_SID")

    # Try Twilio SMS if real credentials are fully configured
    if TWILIO_AVAILABLE and account_sid and auth_token and verify_sid and not ("xxxx" in account_sid.lower() or account_sid.startswith("ACYOUR")):
        try:
            client = Client(account_sid, auth_token)
            verification = client.verify.v2.services(verify_sid).verifications.create(
                to=formatted_phone,
                channel="sms"
            )
            return {
                "status": "success",
                "message": f"OTP successfully sent to {formatted_phone} via SMS (Demo OTP: 123456)",
                "to": formatted_phone,
                "demo_otp": "123456",
                "sid": verification.sid,
                "verification_status": verification.status
            }
        except Exception as e:
            # Fallback to Demo OTP gracefully if Twilio fails
            pass

    return {
        "status": "success",
        "message": f"Demo OTP 123456 generated for {formatted_phone}",
        "to": formatted_phone,
        "demo_otp": "123456"
    }

@router.post("/verify-otp")
def verify_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    """
    Verifies 6-digit OTP code (accepts Demo OTP: 123456 or Twilio code).
    If valid, authenticates and returns citizen user profile from PostgreSQL database.
    """
    try:
        formatted_phone = format_e164_phone(req.phone)
    except ValueError as err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(err))

    code = req.code.strip() if req.code else ""
    if not code or len(code) != 6 or not code.isdigit():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please enter a complete 6-digit numeric OTP code."
        )

    # Demo OTP check (123456)
    is_approved = (code == "123456")

    # If code is not 123456, attempt Twilio verification check if configured
    if not is_approved:
        account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        verify_sid = os.getenv("TWILIO_VERIFY_SERVICE_SID")
        if TWILIO_AVAILABLE and account_sid and auth_token and verify_sid and not ("xxxx" in account_sid.lower()):
            try:
                client = Client(account_sid, auth_token)
                check = client.verify.v2.services(verify_sid).verification_checks.create(
                    to=formatted_phone,
                    code=code
                )
                if check.status == "approved":
                    is_approved = True
            except Exception:
                pass

    if not is_approved:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP. Please use Demo OTP: 123456"
        )

    # Clean 10-digit number for citizen database lookup
    raw_digits = re.sub(r"\D", "", req.phone)
    clean_10 = raw_digits[-10:] if len(raw_digits) >= 10 else raw_digits

    citizen = None
    try:
        citizen = crud.get_citizen_by_phone(db, phone=clean_10)
        if not citizen:
            citizen = crud.get_citizen_by_phone(db, phone=formatted_phone)
    except Exception:
        pass

    return {
        "status": "success",
        "approved": True,
        "message": "OTP verified successfully",
        "phone": formatted_phone,
        "citizen": citizen
    }
