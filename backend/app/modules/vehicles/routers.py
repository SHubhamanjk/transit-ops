from fastapi import APIRouter, Depends, Query, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.db.database import get_db
from app.db.models.user import User, RoleEnum
from app.modules.auth.utils import get_current_user, require_role
from app.modules.vehicles.schemas import VehicleCreate, VehicleUpdate, VehicleStatusUpdate, VehicleResponse, VehicleDetailResponse
from app.modules.vehicles import services

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])

from datetime import datetime
from typing import List, Optional

@router.get("/", response_model=List[VehicleResponse])
async def list_vehicles(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, le=100),
    type: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    created_after: Optional[datetime] = None,
    created_before: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List vehicles with optional advanced filters and pagination. All authenticated users can view."""
    return await services.get_vehicles(
        db, skip=skip, limit=limit, type_filter=type, status_filter=status,
        search=search, created_after=created_after, created_before=created_before
    )

@router.get("/{vehicle_id}", response_model=VehicleDetailResponse)
async def get_vehicle(vehicle_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get vehicle by ID, including its trip history."""
    return await services.get_vehicle_by_id(db, vehicle_id)

@router.post("/", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
async def create_vehicle(
    vehicle_in: VehicleCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.FLEET_MANAGER]))
):
    """Register a new vehicle. Restricted to Fleet Manager."""
    return await services.create_vehicle(db, vehicle_in, background_tasks)

@router.put("/{vehicle_id}", response_model=VehicleResponse)
async def update_vehicle(
    vehicle_id: str,
    vehicle_update: VehicleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.FLEET_MANAGER]))
):
    """Update vehicle details. Restricted to Fleet Manager."""
    return await services.update_vehicle(db, vehicle_id, vehicle_update)

@router.put("/{vehicle_id}/status", response_model=VehicleResponse)
async def update_vehicle_status(
    vehicle_id: str,
    status_update: VehicleStatusUpdate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.FLEET_MANAGER]))
):
    """Update vehicle status (e.g., Retire). Restricted to Fleet Manager."""
    return await services.update_vehicle_status(db, vehicle_id, status_update, background_tasks)
