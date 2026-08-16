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
    code: str = Field(..., description="6-digit OTP code received via SMS")

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

def get_twilio_client():
    """
    Reads Twilio credentials from environment variables (backend/.env) and initializes Twilio REST client.
    """
    if not TWILIO_AVAILABLE:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Twilio Python SDK is not installed. Please run 'pip install twilio'."
        )

    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    verify_sid = os.getenv("TWILIO_VERIFY_SERVICE_SID")

    if not account_sid or not auth_token or not verify_sid:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID) are missing in backend/.env."
        )

    if (
        "xxxx" in account_sid.lower() or 
        "xxxx" in auth_token.lower() or 
        "xxxx" in verify_sid.lower() or 
        account_sid.startswith("ACYOUR") or
        verify_sid.startswith("VAYOUR")
    ):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Twilio credentials in backend/.env contain placeholders. Please add your real Account SID, Auth Token, and Verify Service SID."
        )

    return Client(account_sid, auth_token), verify_sid

@router.post("/send-otp")
def send_otp(req: SendOTPRequest):
    """
    Validates mobile number to E.164 format and triggers an SMS OTP via Twilio Verify.
    """
    try:
        formatted_phone = format_e164_phone(req.phone)
    except ValueError as err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(err))

    client, verify_sid = get_twilio_client()

    try:
        verification = client.verify.v2.services(verify_sid).verifications.create(
            to=formatted_phone,
            channel="sms"
        )
        return {
            "status": "success",
            "message": f"OTP successfully sent to {formatted_phone} via Twilio SMS",
            "to": formatted_phone,
            "sid": verification.sid,
            "verification_status": verification.status
        }
    except TwilioRestException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Twilio SMS Error ({e.code}): {e.msg}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send SMS OTP: {str(e)}"
        )

@router.post("/verify-otp")
def verify_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    """
    Verifies 6-digit OTP code using Twilio Verify API.
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

    client, verify_sid = get_twilio_client()

    try:
        verification_check = client.verify.v2.services(verify_sid).verification_checks.create(
            to=formatted_phone,
            code=code
        )
    except TwilioRestException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Twilio Verification Error ({e.code}): {e.msg}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to verify OTP code: {str(e)}"
        )

    if verification_check.status != "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP. Please check your 6-digit code and try again."
        )

    # Clean 10-digit number for citizen database lookup
    raw_digits = re.sub(r"\D", "", req.phone)
    clean_10 = raw_digits[-10:] if len(raw_digits) >= 10 else raw_digits

    citizen = crud.get_citizen_by_phone(db, phone=clean_10)
    if not citizen:
        citizen = crud.get_citizen_by_phone(db, phone=formatted_phone)

    return {
        "status": "success",
        "approved": True,
        "message": "OTP verified successfully",
        "phone": formatted_phone,
        "citizen": citizen
    }
