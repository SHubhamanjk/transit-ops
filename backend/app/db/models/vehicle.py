import enum
import uuid
from sqlalchemy import Column, String, Numeric, Enum, DateTime, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.database import Base

class VehicleStatusEnum(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    ON_TRIP = "ON_TRIP"
    IN_SHOP = "IN_SHOP"
    RETILED = "RETIRED"

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    registration_number = Column(String, unique=True, index=True, nullable=False)
    model = Column(String, nullable=False)
    type = Column(String, nullable=False)
    max_load_capacity = Column(Numeric(10, 2), nullable=False)
    odometer = Column(Numeric(10, 2), nullable=False, default=0.0)
    acquisition_cost = Column(Numeric(10, 2), nullable=False)
    total_trip_cost = Column(Numeric(10, 2), nullable=False, default=0.0)
    total_maintenance_cost = Column(Numeric(10, 2), nullable=False, default=0.0)
    total_fuel_consumed = Column(Numeric(10, 2), nullable=False, default=0.0)
    last_maintained_date = Column(Date, nullable=True)
    status = Column(Enum(VehicleStatusEnum), nullable=False, default=VehicleStatusEnum.AVAILABLE, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
