from fastapi import APIRouter, Depends, Query, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.db.database import get_db
from app.db.models.user import User, RoleEnum
from app.modules.auth.utils import get_current_user, require_role
from app.modules.drivers.schemas import DriverCreate, DriverUpdate, DriverStatusUpdate, DriverResponse, DriverDetailResponse
from app.modules.drivers import services

router = APIRouter(prefix="/drivers", tags=["Drivers"])

from datetime import datetime
from typing import List, Optional

@router.get("/", response_model=List[DriverResponse])
async def list_drivers(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, le=100),
    status: Optional[str] = None,
    search: Optional[str] = None,
    created_after: Optional[datetime] = None,
    created_before: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List drivers with optional advanced filters and pagination. All authenticated users can view."""
    return await services.get_drivers(
        db, skip=skip, limit=limit, status_filter=status,
        search=search, created_after=created_after, created_before=created_before
    )

@router.get("/{driver_id}", response_model=DriverDetailResponse)
async def get_driver(driver_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get driver by ID, including their trip history."""
    return await services.get_driver_by_id(db, driver_id)

@router.post("/", response_model=DriverResponse, status_code=status.HTTP_201_CREATED)
async def create_driver(
    driver_in: DriverCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.FLEET_MANAGER, RoleEnum.SAFETY_OFFICER]))
):
    """Register a new driver. Restricted to Fleet Manager or Safety Officer."""
    return await services.create_driver(db, driver_in, background_tasks)

@router.put("/{driver_id}", response_model=DriverResponse)
async def update_driver(
    driver_id: str,
    driver_update: DriverUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.FLEET_MANAGER, RoleEnum.SAFETY_OFFICER]))
):
    """Update driver details."""
    return await services.update_driver(db, driver_id, driver_update)

@router.put("/{driver_id}/status", response_model=DriverResponse)
async def update_driver_status(
    driver_id: str,
    status_update: DriverStatusUpdate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.SAFETY_OFFICER]))
):
    """Update driver status (e.g., Suspend). Restricted to Safety Officer."""
    return await services.update_driver_status(db, driver_id, status_update, background_tasks)
