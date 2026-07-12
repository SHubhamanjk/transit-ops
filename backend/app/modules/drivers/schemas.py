from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID
from typing import Optional
from datetime import date, datetime
from decimal import Decimal
from app.db.models.driver import DriverStatusEnum

class DriverBase(BaseModel):
    name: str
    license_number: str
    license_category: str
    license_expiry_date: date
    contact_number: str

class DriverCreate(DriverBase):
    user_id: Optional[UUID] = None

class DriverUpdate(BaseModel):
    name: Optional[str] = None
    license_category: Optional[str] = None
    license_expiry_date: Optional[date] = None
    contact_number: Optional[str] = None

class DriverStatusUpdate(BaseModel):
    status: DriverStatusEnum

class DriverResponse(DriverBase):
    id: UUID
    user_id: Optional[UUID]
    safety_score: Decimal
    status: DriverStatusEnum
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
