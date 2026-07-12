from pydantic import BaseModel, EmailStr
from uuid import UUID
from app.db.models.user import RoleEnum

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: RoleEnum

class UserResponse(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    role: RoleEnum

    class Config:
        from_attributes = True

class LoginInitiate(BaseModel):
    email: EmailStr
    password: str

class LoginConfirm(BaseModel):
    email: EmailStr
    otp_code: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

class ForgotPassword(BaseModel):
    email: EmailStr

class ResetPassword(BaseModel):
    email: EmailStr
    otp_code: str
    new_password: str

