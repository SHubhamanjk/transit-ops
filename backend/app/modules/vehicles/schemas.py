from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional
from decimal import Decimal
from datetime import datetime
from app.db.models.vehicle import VehicleStatusEnum

class VehicleBase(BaseModel):
    registration_number: str
    model: str
    type: str
    max_load_capacity: Decimal
    acquisition_cost: Decimal

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    model: Optional[str] = None
    type: Optional[str] = None
    max_load_capacity: Optional[Decimal] = None
    acquisition_cost: Optional[Decimal] = None

class VehicleStatusUpdate(BaseModel):
    status: VehicleStatusEnum

class VehicleResponse(VehicleBase):
    id: UUID
    odometer: Decimal
    status: VehicleStatusEnum
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
