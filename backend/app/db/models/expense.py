import enum
import uuid
from sqlalchemy import Column, String, Numeric, Enum, DateTime, ForeignKey, Date, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.database import Base

class ExpenseTypeEnum(str, enum.Enum):
    FUEL = "FUEL"
    MAINTENANCE = "MAINTENANCE"
    TOLL = "TOLL"
    TRIP_COST = "TRIP_COST"
    OTHER = "OTHER"

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False, index=True)
    trip_id = Column(UUID(as_uuid=True), ForeignKey("trips.id", ondelete="SET NULL"), nullable=True, index=True)
    
    type = Column(Enum(ExpenseTypeEnum), nullable=False, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    liters = Column(Numeric(10, 2), nullable=True) # Used for fuel
    description = Column(Text, nullable=True)
    date = Column(Date, nullable=False, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
