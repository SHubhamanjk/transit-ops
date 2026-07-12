from fastapi import APIRouter, Depends, Query, status, BackgroundTasks, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from app.db.database import get_db
from app.db.models.user import User, RoleEnum
from app.db.models.driver import Driver
from app.modules.auth.utils import get_current_user, require_role
from app.modules.trips.schemas import TripCreate, TripComplete, TripResponse
from app.modules.trips import services

router = APIRouter(prefix="/trips", tags=["Trips"])

@router.get("/", response_model=List[TripResponse])
async def list_trips(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, le=100),
    driver_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List trips. Drivers can only view their own. Others can view all."""
    if current_user.role == RoleEnum.DRIVER:
        driver_query = select(Driver).where(Driver.user_id == current_user.id)
        driver_result = await db.execute(driver_query)
        driver = driver_result.scalars().first()
        if not driver:
            raise HTTPException(status_code=403, detail="Driver profile not found")
        # Enforce that drivers only see their own trips
        driver_id = str(driver.id)
        
    return await services.get_trips(db, skip=skip, limit=limit, driver_id=driver_id, status_filter=status_filter)

@router.get("/{trip_id}", response_model=TripResponse)
async def get_trip(trip_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get trip by ID."""
    return await services.get_trip_by_id(db, trip_id)

@router.post("/", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
async def create_trip(
    trip_in: TripCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.FLEET_MANAGER, RoleEnum.DRIVER]))
):
    """Create a DRAFT trip. Enforces weight capacity and license validity."""
    return await services.create_trip(db, trip_in)

@router.put("/{trip_id}/dispatch", response_model=TripResponse)
async def dispatch_trip(
    trip_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.FLEET_MANAGER, RoleEnum.DRIVER]))
):
    """Dispatch a trip. Updates vehicle and driver status to ON_TRIP."""
    return await services.dispatch_trip(db, trip_id, background_tasks)

@router.put("/{trip_id}/complete", response_model=TripResponse)
async def complete_trip(
    trip_id: str,
    complete_data: TripComplete,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.FLEET_MANAGER, RoleEnum.DRIVER]))
):
    """Complete a trip. Frees up vehicle and driver to AVAILABLE."""
    return await services.complete_trip(db, trip_id, complete_data, background_tasks)

@router.put("/{trip_id}/cancel", response_model=TripResponse)
async def cancel_trip(
    trip_id: str,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.FLEET_MANAGER, RoleEnum.DRIVER]))
):
    """Cancel a trip. Reverts statuses to AVAILABLE if it was dispatched."""
    return await services.cancel_trip(db, trip_id, background_tasks)
