from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Dict, Any
from app.db.database import get_db
from app.db.models.user import User, RoleEnum
from app.db.models.dashboard_stats import DashboardStat
from app.modules.auth.utils import get_current_user, require_role

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/kpis", response_model=Dict[str, Any])
async def get_kpis(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.FLEET_MANAGER, RoleEnum.FINANCIAL_ANALYST, RoleEnum.SAFETY_OFFICER]))
):
    """Fetch precalculated KPIs."""
    query = select(DashboardStat)
    result = await db.execute(query)
    
    stats = {}
    for stat in result.scalars().all():
        stats[stat.id] = stat.value
        
    return stats

@router.get("/reports", response_model=Dict[str, Any])
async def get_reports(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.FLEET_MANAGER, RoleEnum.FINANCIAL_ANALYST]))
):
    """Fetch financial and efficiency reports."""
    query = select(DashboardStat)
    result = await db.execute(query)
    
    all_stats = {}
    for stat in result.scalars().all():
        all_stats[stat.id] = stat.value
        
    reports = {
        "total_operational_cost": all_stats.get("total_operational_cost", 0.0),
        "total_fuel_cost": all_stats.get("total_fuel_cost", 0.0),
        "total_trip_cost": all_stats.get("total_trip_cost", 0.0),
        "total_maintenance_cost": all_stats.get("total_maintenance_cost", 0.0),
        "fleet_utilization": all_stats.get("fleet_utilization", 0.0)
    }
    
    return reports
