from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status, BackgroundTasks
from app.db.models.driver import Driver, DriverStatusEnum
from app.modules.drivers.schemas import DriverCreate, DriverUpdate, DriverStatusUpdate
from app.services.dashboard_service import recalculate_driver_stats
from app.modules.auth.schemas import UserCreate
from app.modules.auth.services import create_user
from app.db.models.user import RoleEnum

from datetime import datetime
from sqlalchemy import or_

async def get_available_drivers_dropdown(db: AsyncSession):
    query = select(Driver).where(Driver.status == DriverStatusEnum.AVAILABLE).order_by(Driver.name)
    result = await db.execute(query)
    return result.scalars().all()

async def get_drivers(
    db: AsyncSession, skip: int = 0, limit: int = 10, status_filter: str = None,
    search: str = None, created_after: datetime = None, created_before: datetime = None
):
    query = select(Driver)
    if status_filter:
        query = query.where(Driver.status == status_filter)
        
    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                Driver.name.ilike(search_term),
                Driver.license_number.ilike(search_term),
                Driver.license_category.ilike(search_term),
                Driver.contact_number.ilike(search_term)
            )
        )
        
    if created_after:
        query = query.where(Driver.created_at >= created_after)
    if created_before:
        query = query.where(Driver.created_at <= created_before)
        
    query = query.offset(skip).limit(limit).order_by(Driver.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

async def get_driver_by_id(db: AsyncSession, driver_id: str):
    query = select(Driver).where(Driver.id == driver_id)
    result = await db.execute(query)
    driver = result.scalars().first()
    if not driver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")
        
    from app.db.models.trip import Trip
    trip_query = select(Trip).where(Trip.driver_id == driver_id).order_by(Trip.created_at.desc())
    trip_result = await db.execute(trip_query)
    driver.trips = trip_result.scalars().all()
    
    return driver

async def create_driver(db: AsyncSession, driver_in: DriverCreate, background_tasks: BackgroundTasks):
    # Check if license number already exists
    query = select(Driver).where(Driver.license_number == driver_in.license_number)
    result = await db.execute(query)
    if result.scalars().first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="License number already registered")
        
    if driver_in.create_user_login and driver_in.email and driver_in.password:
        user_in = UserCreate(
            name=driver_in.name,
            email=driver_in.email,
            password=driver_in.password,
            role=RoleEnum.DRIVER
        )
        new_user = await create_user(db, user_in)
        driver_in.user_id = new_user.id
        
    driver_dump = driver_in.model_dump(exclude={"create_user_login", "email", "password"})
    new_driver = Driver(**driver_dump)
    db.add(new_driver)
    await db.commit()
    await db.refresh(new_driver)
    background_tasks.add_task(recalculate_driver_stats)
    return new_driver

async def update_driver(db: AsyncSession, driver_id: str, driver_update: DriverUpdate):
    driver = await get_driver_by_id(db, driver_id)
    
    update_data = driver_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(driver, key, value)
        
    db.add(driver)
    await db.commit()
    await db.refresh(driver)
    return driver

async def update_driver_status(db: AsyncSession, driver_id: str, status_update: DriverStatusUpdate, background_tasks: BackgroundTasks):
    driver = await get_driver_by_id(db, driver_id)
    
    driver.status = status_update.status
    db.add(driver)
    await db.commit()
    await db.refresh(driver)
    
    background_tasks.add_task(recalculate_driver_stats)
    return driver
