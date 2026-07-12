from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status, BackgroundTasks
from datetime import datetime, timezone, date
from app.db.models.trip import Trip, TripStatusEnum
from app.db.models.vehicle import Vehicle, VehicleStatusEnum
from app.db.models.driver import Driver, DriverStatusEnum
from app.modules.trips.schemas import TripCreate, TripComplete
from app.services.dashboard_service import recalculate_trip_stats, recalculate_vehicle_stats, recalculate_driver_stats

async def get_trips(db: AsyncSession, skip: int = 0, limit: int = 10, driver_id: str = None, status_filter: str = None):
    query = select(Trip)
    if driver_id:
        query = query.where(Trip.driver_id == driver_id)
    if status_filter:
        query = query.where(Trip.status == status_filter)
        
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

async def get_trip_by_id(db: AsyncSession, trip_id: str):
    query = select(Trip).where(Trip.id == trip_id)
    result = await db.execute(query)
    trip = result.scalars().first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    return trip

async def create_trip(db: AsyncSession, trip_in: TripCreate):
    # Validate Vehicle
    v_query = select(Vehicle).where(Vehicle.id == trip_in.vehicle_id)
    vehicle = (await db.execute(v_query)).scalars().first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    if vehicle.status != VehicleStatusEnum.AVAILABLE:
        raise HTTPException(status_code=400, detail="Vehicle is not available for a new trip")
    if trip_in.cargo_weight > vehicle.max_load_capacity:
        raise HTTPException(status_code=400, detail=f"Cargo weight exceeds vehicle capacity ({vehicle.max_load_capacity})")

    # Validate Driver
    d_query = select(Driver).where(Driver.id == trip_in.driver_id)
    driver = (await db.execute(d_query)).scalars().first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    if driver.status != DriverStatusEnum.AVAILABLE:
        raise HTTPException(status_code=400, detail="Driver is not available")
    if driver.license_expiry_date < date.today():
        raise HTTPException(status_code=400, detail="Driver license is expired")

    new_trip = Trip(**trip_in.model_dump(), status=TripStatusEnum.DRAFT)
    db.add(new_trip)
    await db.commit()
    await db.refresh(new_trip)
    return new_trip

async def dispatch_trip(db: AsyncSession, trip_id: str, background_tasks: BackgroundTasks):
    trip = await get_trip_by_id(db, trip_id)
    if trip.status != TripStatusEnum.DRAFT:
        raise HTTPException(status_code=400, detail="Only DRAFT trips can be dispatched")

    # Fetch Vehicle & Driver
    vehicle = (await db.execute(select(Vehicle).where(Vehicle.id == trip.vehicle_id))).scalars().first()
    driver = (await db.execute(select(Driver).where(Driver.id == trip.driver_id))).scalars().first()
    
    if vehicle.status != VehicleStatusEnum.AVAILABLE or driver.status != DriverStatusEnum.AVAILABLE:
         raise HTTPException(status_code=400, detail="Driver or Vehicle is no longer available. Cannot dispatch.")

    # Update statuses
    trip.status = TripStatusEnum.DISPATCHED
    trip.dispatched_at = datetime.now(timezone.utc)
    vehicle.status = VehicleStatusEnum.ON_TRIP
    driver.status = DriverStatusEnum.ON_TRIP

    db.add_all([trip, vehicle, driver])
    await db.commit()
    await db.refresh(trip)

    background_tasks.add_task(recalculate_trip_stats)
    background_tasks.add_task(recalculate_vehicle_stats)
    return trip

async def complete_trip(db: AsyncSession, trip_id: str, complete_data: TripComplete, background_tasks: BackgroundTasks):
    trip = await get_trip_by_id(db, trip_id)
    if trip.status != TripStatusEnum.DISPATCHED:
        raise HTTPException(status_code=400, detail="Only DISPATCHED trips can be completed")

    # Fetch Vehicle & Driver
    vehicle = (await db.execute(select(Vehicle).where(Vehicle.id == trip.vehicle_id))).scalars().first()
    driver = (await db.execute(select(Driver).where(Driver.id == trip.driver_id))).scalars().first()

    # Update Trip
    trip.status = TripStatusEnum.COMPLETED
    trip.completed_at = datetime.now(timezone.utc)
    trip.actual_distance = complete_data.actual_distance
    trip.actual_duration_hours = complete_data.actual_duration_hours
    trip.fuel_consumed = complete_data.fuel_consumed
    trip.completion_notes = complete_data.completion_notes
    trip.total_cost = complete_data.total_cost
    
    if vehicle:
        vehicle.status = VehicleStatusEnum.AVAILABLE
        vehicle.odometer += complete_data.actual_distance
        vehicle.total_trip_cost += complete_data.total_cost
        if complete_data.fuel_consumed:
            vehicle.total_fuel_consumed += complete_data.fuel_consumed
        db.add(vehicle)
        
    if driver:
        driver.status = DriverStatusEnum.AVAILABLE
        driver.total_trip_cost += complete_data.total_cost
        db.add(driver)

    db.add(trip)
    
    # Create an Expense entry automatically for the trip cost
    from app.db.models.expense import Expense, ExpenseTypeEnum
    new_expense = Expense(
        vehicle_id=trip.vehicle_id,
        type=ExpenseTypeEnum.TRIP_COST,
        amount=complete_data.total_cost,
        description=f"Total Trip Cost - Trip ID: {trip.id}",
        date=trip.completed_at.date()
    )
    db.add(new_expense)
    await db.commit()
    await db.refresh(trip)

    background_tasks.add_task(recalculate_trip_stats)
    background_tasks.add_task(recalculate_vehicle_stats)
    return trip

async def cancel_trip(db: AsyncSession, trip_id: str, background_tasks: BackgroundTasks):
    trip = await get_trip_by_id(db, trip_id)
    if trip.status in [TripStatusEnum.COMPLETED, TripStatusEnum.CANCELLED]:
        raise HTTPException(status_code=400, detail="Cannot cancel a completed or already cancelled trip")

    was_dispatched = trip.status == TripStatusEnum.DISPATCHED
    trip.status = TripStatusEnum.CANCELLED

    if was_dispatched:
        vehicle = (await db.execute(select(Vehicle).where(Vehicle.id == trip.vehicle_id))).scalars().first()
        driver = (await db.execute(select(Driver).where(Driver.id == trip.driver_id))).scalars().first()
        if vehicle:
            vehicle.status = VehicleStatusEnum.AVAILABLE
            db.add(vehicle)
        if driver:
            driver.status = DriverStatusEnum.AVAILABLE
            db.add(driver)
            
    db.add(trip)
    await db.commit()
    await db.refresh(trip)

    background_tasks.add_task(recalculate_trip_stats)
    if was_dispatched:
        background_tasks.add_task(recalculate_vehicle_stats)
        
    return trip
