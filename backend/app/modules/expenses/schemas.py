from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional
from decimal import Decimal
from datetime import date, datetime
from app.db.models.expense import ExpenseTypeEnum

class ExpenseBase(BaseModel):
    vehicle_id: UUID
    trip_id: Optional[UUID] = None
    type: ExpenseTypeEnum
    amount: Decimal
    liters: Optional[Decimal] = None # For fuel
    description: Optional[str] = None
    date: date

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseResponse(ExpenseBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
