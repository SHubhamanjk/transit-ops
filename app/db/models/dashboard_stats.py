from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.sql import func
from app.db.database import Base

class DashboardStat(Base):
    __tablename__ = "dashboard_stats"

    id = Column(String, primary_key=True) # e.g., 'active_vehicles', 'fleet_utilization'
    value = Column(JSON, nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
