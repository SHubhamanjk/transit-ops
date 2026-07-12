from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status, BackgroundTasks
from app.db.models.maintenance import MaintenanceLog, MaintenanceStatusEnum
from app.db.models.vehicle import Vehicle, VehicleStatusEnum
from app.db.models.expense import Expense, ExpenseTypeEnum
from app.modules.maintenance.schemas import MaintenanceCreate, MaintenanceComplete
from app.services.dashboard_service import recalculate_vehicle_stats, recalculate_financial_stats

async def get_maintenance_logs(db: AsyncSession, skip: int = 0, limit: int = 10, vehicle_id: str = None, status_filter: str = None):
    query = select(MaintenanceLog)
    if vehicle_id:
        query = query.where(MaintenanceLog.vehicle_id == vehicle_id)
    if status_filter:
        query = query.where(MaintenanceLog.status == status_filter)
        
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

async def create_maintenance(db: AsyncSession, log_in: MaintenanceCreate, background_tasks: BackgroundTasks):
    vehicle_q = select(Vehicle).where(Vehicle.id == log_in.vehicle_id)
    vehicle = (await db.execute(vehicle_q)).scalars().first()
    
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
        
    if vehicle.status == VehicleStatusEnum.RETILED:
        raise HTTPException(status_code=400, detail="Cannot perform maintenance on a retired vehicle")
    
    if vehicle.status == VehicleStatusEnum.ON_TRIP:
        raise HTTPException(status_code=400, detail="Cannot perform maintenance while vehicle is on a trip")

    new_log = MaintenanceLog(**log_in.model_dump(), status=MaintenanceStatusEnum.ACTIVE)
    db.add(new_log)
    
    # Change vehicle status to IN_SHOP
    vehicle.status = VehicleStatusEnum.IN_SHOP
    db.add(vehicle)
    
    await db.commit()
    await db.refresh(new_log)
    
    background_tasks.add_task(recalculate_vehicle_stats)
    return new_log

async def complete_maintenance(db: AsyncSession, log_id: str, complete_data: MaintenanceComplete, background_tasks: BackgroundTasks):
    log_q = select(MaintenanceLog).where(MaintenanceLog.id == log_id)
    log = (await db.execute(log_q)).scalars().first()
    
    if not log:
        raise HTTPException(status_code=404, detail="Maintenance log not found")
    if log.status == MaintenanceStatusEnum.COMPLETED:
        raise HTTPException(status_code=400, detail="Already completed")
        
    log.status = MaintenanceStatusEnum.COMPLETED
    log.end_date = complete_data.end_date
    log.actual_duration_hours = complete_data.actual_duration_hours
    log.total_cost = complete_data.total_cost
    log.parts_used = complete_data.parts_used
    log.mechanic_notes = complete_data.mechanic_notes
    db.add(log)
    
    # Free up the vehicle
    vehicle_q = select(Vehicle).where(Vehicle.id == log.vehicle_id)
    vehicle = (await db.execute(vehicle_q)).scalars().first()
    if vehicle:
        if vehicle.status == VehicleStatusEnum.IN_SHOP:
            vehicle.status = VehicleStatusEnum.AVAILABLE
        vehicle.total_maintenance_cost += complete_data.total_cost
        db.add(vehicle)
        
    # Create an Expense entry automatically for the maintenance cost using the FINAL cost
    new_expense = Expense(
        vehicle_id=log.vehicle_id,
        type=ExpenseTypeEnum.MAINTENANCE,
        amount=complete_data.total_cost,
        description=log.description,
        date=complete_data.end_date
    )
    db.add(new_expense)

    await db.commit()
    await db.refresh(log)
    
    background_tasks.add_task(recalculate_vehicle_stats)
    background_tasks.add_task(recalculate_financial_stats)
    
    return log
