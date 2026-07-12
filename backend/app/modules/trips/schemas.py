from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional
from decimal import Decimal
from datetime import datetime
from app.db.models.trip import TripStatusEnum

class TripBase(BaseModel):
    source: str
    destination: str
    vehicle_id: UUID
    driver_id: UUID
    cargo_weight: Decimal
    planned_distance: Decimal
    estimated_duration_hours: Decimal

class TripCreate(TripBase):
    pass

class TripComplete(BaseModel):
    actual_distance: Decimal
    fuel_consumed: Optional[Decimal] = None
    completion_notes: Optional[str] = None
    total_cost: Decimal
    actual_duration_hours: Decimal

class TripResponse(TripBase):
    id: UUID
    status: TripStatusEnum
    actual_distance: Optional[Decimal]
    actual_duration_hours: Optional[Decimal]
    fuel_consumed: Optional[Decimal]
    completion_notes: Optional[str]
    total_cost: Optional[Decimal]
    dispatched_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
