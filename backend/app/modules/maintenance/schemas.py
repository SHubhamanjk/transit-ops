from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional
from decimal import Decimal
from datetime import date, datetime
from app.db.models.maintenance import MaintenanceStatusEnum

class MaintenanceBase(BaseModel):
    vehicle_id: UUID
    description: str
    start_date: date
    estimated_duration_hours: Decimal

class MaintenanceCreate(MaintenanceBase):
    pass

class MaintenanceComplete(BaseModel):
    end_date: date
    total_cost: Decimal
    actual_duration_hours: Decimal
    parts_used: Optional[str] = None
    mechanic_notes: Optional[str] = None

class MaintenanceResponse(MaintenanceBase):
    id: UUID
    status: MaintenanceStatusEnum
    end_date: Optional[date]
    actual_duration_hours: Optional[Decimal]
    total_cost: Optional[Decimal]
    parts_used: Optional[str]
    mechanic_notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
