import enum
import uuid
from sqlalchemy import Column, String, Numeric, Enum, DateTime, ForeignKey, Date, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.database import Base

class MaintenanceStatusEnum(str, enum.Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"

class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False, index=True)
    description = Column(Text, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    estimated_duration_hours = Column(Numeric(10, 2), nullable=False)
    actual_duration_hours = Column(Numeric(10, 2), nullable=True)
    
    total_cost = Column(Numeric(10, 2), nullable=True)
    parts_used = Column(Text, nullable=True)
    mechanic_notes = Column(Text, nullable=True)
    
    status = Column(Enum(MaintenanceStatusEnum), nullable=False, default=MaintenanceStatusEnum.ACTIVE, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
