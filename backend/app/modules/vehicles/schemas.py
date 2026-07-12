from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional
from decimal import Decimal
from datetime import datetime, date
from app.db.models.vehicle import VehicleStatusEnum

class VehicleBase(BaseModel):
    registration_number: str
    model: str
    type: str
    max_load_capacity: Decimal
    odometer: Decimal
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
    total_trip_cost: Decimal
    total_maintenance_cost: Decimal
    total_fuel_consumed: Decimal
    last_maintained_date: Optional[date] = None
    status: VehicleStatusEnum
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

from typing import List
from app.modules.trips.schemas import TripResponse
from app.modules.maintenance.schemas import MaintenanceResponse

class VehicleDetailResponse(VehicleResponse):
    trips: List[TripResponse] = []

class VehicleDropdownResponse(BaseModel):
    id: UUID
    license_plate: str
    make: str
    model: str
    maintenance_logs: List[MaintenanceResponse] = []
