from fastapi import APIRouter, Depends, Query, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.db.database import get_db
from app.db.models.user import User, RoleEnum
from app.modules.auth.utils import get_current_user, require_role
from app.modules.maintenance.schemas import MaintenanceCreate, MaintenanceComplete, MaintenanceResponse
from app.modules.maintenance import services

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])

@router.get("/", response_model=List[MaintenanceResponse])
async def list_maintenance_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, le=100),
    vehicle_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List maintenance logs."""
    return await services.get_maintenance_logs(db, skip=skip, limit=limit, vehicle_id=vehicle_id, status_filter=status_filter)

@router.post("/", response_model=MaintenanceResponse, status_code=status.HTTP_201_CREATED)
async def create_maintenance_log(
    log_in: MaintenanceCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.FLEET_MANAGER]))
):
    """Create a maintenance record. Automatically sets Vehicle status to IN_SHOP."""
    return await services.create_maintenance(db, log_in, background_tasks)

@router.put("/{log_id}/complete", response_model=MaintenanceResponse)
async def complete_maintenance_log(
    log_id: str,
    complete_data: MaintenanceComplete,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.FLEET_MANAGER]))
):
    """Closes maintenance record. Frees Vehicle back to AVAILABLE and logs an Expense automatically."""
    return await services.complete_maintenance(db, log_id, complete_data, background_tasks)
