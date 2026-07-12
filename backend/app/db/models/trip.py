import enum
import uuid
from sqlalchemy import Column, String, Numeric, Enum, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.database import Base

class TripStatusEnum(str, enum.Enum):
    DRAFT = "DRAFT"
    DISPATCHED = "DISPATCHED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class Trip(Base):
    __tablename__ = "trips"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey("vehicles.id", ondelete="RESTRICT"), nullable=False, index=True)
    driver_id = Column(UUID(as_uuid=True), ForeignKey("drivers.id", ondelete="RESTRICT"), nullable=False, index=True)
    
    cargo_weight = Column(Numeric(10, 2), nullable=False)
    planned_distance = Column(Numeric(10, 2), nullable=False)
    actual_distance = Column(Numeric(10, 2), nullable=True)
    
    status = Column(Enum(TripStatusEnum), nullable=False, default=TripStatusEnum.DRAFT, index=True)
    
    dispatched_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
