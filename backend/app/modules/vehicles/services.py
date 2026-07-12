from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status, BackgroundTasks
from app.db.models.vehicle import Vehicle, VehicleStatusEnum
from app.modules.vehicles.schemas import VehicleCreate, VehicleUpdate, VehicleStatusUpdate
from app.services.dashboard_service import recalculate_vehicle_stats

from datetime import datetime
from sqlalchemy import or_

async def get_vehicles(
    db: AsyncSession, skip: int = 0, limit: int = 10, type_filter: str = None, status_filter: str = None,
    search: str = None, created_after: datetime = None, created_before: datetime = None
):
    query = select(Vehicle)
    if type_filter:
        query = query.where(Vehicle.type == type_filter)
    if status_filter:
        query = query.where(Vehicle.status == status_filter)
        
    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                Vehicle.model.ilike(search_term),
                Vehicle.registration_number.ilike(search_term),
                Vehicle.type.ilike(search_term)
            )
        )
        
    if created_after:
        query = query.where(Vehicle.created_at >= created_after)
    if created_before:
        query = query.where(Vehicle.created_at <= created_before)
        
    query = query.offset(skip).limit(limit).order_by(Vehicle.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

async def get_vehicle_by_id(db: AsyncSession, vehicle_id: str):
    query = select(Vehicle).where(Vehicle.id == vehicle_id)
    result = await db.execute(query)
    vehicle = result.scalars().first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
        
    from app.db.models.trip import Trip
    trip_query = select(Trip).where(Trip.vehicle_id == vehicle_id).order_by(Trip.created_at.desc())
    trip_result = await db.execute(trip_query)
    vehicle.trips = trip_result.scalars().all()
    
    from app.db.models.maintenance import MaintenanceLog
    maint_query = select(MaintenanceLog).where(MaintenanceLog.vehicle_id == vehicle_id).order_by(MaintenanceLog.created_at.desc())
    maint_result = await db.execute(maint_query)
    vehicle.maintenance_logs = maint_result.scalars().all()
    
    return vehicle

async def create_vehicle(db: AsyncSession, vehicle_in: VehicleCreate, background_tasks: BackgroundTasks):
    # Check if reg number already exists
    query = select(Vehicle).where(Vehicle.registration_number == vehicle_in.registration_number)
    result = await db.execute(query)
    if result.scalars().first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Registration number already exists")
        
    new_vehicle = Vehicle(**vehicle_in.model_dump())
    db.add(new_vehicle)
    await db.commit()
    await db.refresh(new_vehicle)
    
    background_tasks.add_task(recalculate_vehicle_stats)
    return new_vehicle

async def update_vehicle(db: AsyncSession, vehicle_id: str, vehicle_update: VehicleUpdate):
    vehicle = await get_vehicle_by_id(db, vehicle_id)
    
    update_data = vehicle_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(vehicle, key, value)
        
    db.add(vehicle)
    await db.commit()
    await db.refresh(vehicle)
    return vehicle

async def update_vehicle_status(db: AsyncSession, vehicle_id: str, status_update: VehicleStatusUpdate, background_tasks: BackgroundTasks):
    vehicle = await get_vehicle_by_id(db, vehicle_id)
    
    vehicle.status = status_update.status
    db.add(vehicle)
    await db.commit()
    await db.refresh(vehicle)
    
    background_tasks.add_task(recalculate_vehicle_stats)
    return vehicle
