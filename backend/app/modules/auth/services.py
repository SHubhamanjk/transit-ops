import random
import string
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from app.db.models.user import User
from app.db.models.otp import OTP
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from app.modules.auth.schemas import UserCreate
from app.services.email_service import send_otp_email

async def create_user(db: AsyncSession, user_in: UserCreate) -> User:
    query = select(User).where(User.email == user_in.email)
    result = await db.execute(query)
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = get_password_hash(user_in.password)
    new_user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=hashed_pwd,
        role=user_in.role
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    if new_user.role == "DRIVER" and user_in.driver_details:
        from app.db.models.driver import Driver
        new_driver = Driver(
            user_id=new_user.id,
            name=new_user.name,
            license_number=user_in.driver_details.license_number,
            license_category=user_in.driver_details.license_category,
            license_expiry_date=user_in.driver_details.license_expiry_date,
            contact_number=user_in.driver_details.contact_number
        )
        db.add(new_driver)
        await db.commit()
        
    return new_user

def generate_otp() -> str:
    return ''.join(random.choices(string.digits, k=6))

async def initiate_login(db: AsyncSession, email: str, password: str):
    query = select(User).where(User.email == email)
    result = await db.execute(query)
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User does not exist")
        
    if not verify_password(password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    # Generate OTP
    otp_code = generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=2)
    
    # Store OTP in DB
    new_otp = OTP(user_id=user.id, otp_code=otp_code, expires_at=expires_at)
    db.add(new_otp)
    await db.commit()
    
    email_sent = await send_otp_email(email, otp_code, context="login")
    if not email_sent:
        print("Warning: Email failed to send, but proceeding for dev purposes.")
    print(f"\n\n{'='*40}\nDEBUG LOGIN OTP for {email}: {otp_code}\n{'='*40}\n\n")
    
    return {"message": "OTP sent to email. Please confirm to login."}

async def confirm_login(db: AsyncSession, email: str, otp_code: str):
    query = select(User).where(User.email == email)
    result = await db.execute(query)
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    otp_query = select(OTP).where(OTP.user_id == user.id, OTP.otp_code == otp_code)
    otp_result = await db.execute(otp_query)
    otp = otp_result.scalars().first()
    
    if not otp:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP")
        
    if otp.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP expired")
        
    # Delete OTP after successful use
    await db.delete(otp)
    await db.commit()
    
    # Generate Tokens
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }

async def refresh_access_token(db: AsyncSession, refresh_token: str):
    from app.core.security import decode_token
    payload = decode_token(refresh_token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")
        
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token payload")
        
    query = select(User).where(User.id == user_id)
    result = await db.execute(query)
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        
    # Generate Tokens
    new_access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    new_refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "user": user
    }

async def forgot_password(db: AsyncSession, email: str):
    query = select(User).where(User.email == email)
    result = await db.execute(query)
    user = result.scalars().first()
    
    if not user:
        # Return success anyway to prevent email enumeration
        return {"message": "If that email exists, an OTP has been sent."}
        
    otp_code = generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=2)
    
    new_otp = OTP(user_id=user.id, otp_code=otp_code, expires_at=expires_at)
    db.add(new_otp)
    await db.commit()
    
    await send_otp_email(email, otp_code, context="forgot_password")
    print(f"\n\n{'='*40}\nDEBUG FORGOT PASSWORD OTP for {email}: {otp_code}\n{'='*40}\n\n")
    
    return {"message": "If that email exists, an OTP has been sent."}

async def reset_password(db: AsyncSession, email: str, otp_code: str, new_password: str):
    query = select(User).where(User.email == email)
    result = await db.execute(query)
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    otp_query = select(OTP).where(OTP.user_id == user.id, OTP.otp_code == otp_code)
    otp_result = await db.execute(otp_query)
    otp = otp_result.scalars().first()
    
    if not otp or otp.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OTP")
        
    # Delete OTP
    await db.delete(otp)
    
    # Update Password
    user.password_hash = get_password_hash(new_password)
    db.add(user)
    await db.commit()
    
    return {"message": "Password successfully reset."}
