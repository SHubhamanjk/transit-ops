import json
from sqlalchemy.future import select
from sqlalchemy import func
from app.db.database import AsyncSessionLocal
from app.db.models.dashboard_stats import DashboardStat
from app.db.models.vehicle import Vehicle, VehicleStatusEnum
from app.db.models.driver import Driver, DriverStatusEnum
from app.db.models.trip import Trip, TripStatusEnum
from app.db.models.expense import Expense, ExpenseTypeEnum

async def _upsert_stat(db, stat_id: str, value: any):
    query = select(DashboardStat).where(DashboardStat.id == stat_id)
    result = await db.execute(query)
    stat = result.scalars().first()
    if stat:
        stat.value = value
    else:
        stat = DashboardStat(id=stat_id, value=value)
        db.add(stat)

async def recalculate_vehicle_stats():
    """Background task to recalculate vehicle-related stats."""
    async with AsyncSessionLocal() as db:
        try:
            total = (await db.execute(select(func.count(Vehicle.id)))).scalar() or 0
            active = (await db.execute(select(func.count(Vehicle.id)).where(Vehicle.status == VehicleStatusEnum.AVAILABLE))).scalar() or 0
            on_trip = (await db.execute(select(func.count(Vehicle.id)).where(Vehicle.status == VehicleStatusEnum.ON_TRIP))).scalar() or 0
            in_shop = (await db.execute(select(func.count(Vehicle.id)).where(Vehicle.status == VehicleStatusEnum.IN_SHOP))).scalar() or 0
            
            utilization = ((active + on_trip) / total * 100) if total > 0 else 0.0
            
            await _upsert_stat(db, "total_vehicles", total)
            await _upsert_stat(db, "active_vehicles", active)
            await _upsert_stat(db, "vehicles_on_trip", on_trip)
            await _upsert_stat(db, "vehicles_in_shop", in_shop)
            await _upsert_stat(db, "fleet_utilization", float(round(utilization, 2)))
            
            await db.commit()
        except Exception as e:
            print(f"Error recalculating vehicle stats: {e}")

async def recalculate_driver_stats():
    """Background task to recalculate driver-related stats."""
    async with AsyncSessionLocal() as db:
        try:
            total = (await db.execute(select(func.count(Driver.id)))).scalar() or 0
            active = (await db.execute(select(func.count(Driver.id)).where(Driver.status == DriverStatusEnum.AVAILABLE))).scalar() or 0
            on_trip = (await db.execute(select(func.count(Driver.id)).where(Driver.status == DriverStatusEnum.ON_TRIP))).scalar() or 0
            off_duty = (await db.execute(select(func.count(Driver.id)).where(Driver.status == DriverStatusEnum.OFF_DUTY))).scalar() or 0
            suspended = (await db.execute(select(func.count(Driver.id)).where(Driver.status == DriverStatusEnum.SUSPENDED))).scalar() or 0
            
            avg_safety = (await db.execute(select(func.avg(Driver.safety_score)))).scalar() or 100.0
            
            await _upsert_stat(db, "total_drivers", total)
            await _upsert_stat(db, "active_drivers", active)
            await _upsert_stat(db, "drivers_on_trip", on_trip)
            await _upsert_stat(db, "drivers_off_duty", off_duty)
            await _upsert_stat(db, "suspended_drivers", suspended)
            await _upsert_stat(db, "average_safety_score", float(round(avg_safety, 2)))
            
            await db.commit()
        except Exception as e:
            print(f"Error recalculating driver stats: {e}")

async def recalculate_trip_stats():
    """Background task to recalculate trip-related stats."""
    async with AsyncSessionLocal() as db:
        try:
            total = (await db.execute(select(func.count(Trip.id)))).scalar() or 0
            active = (await db.execute(select(func.count(Trip.id)).where(Trip.status == TripStatusEnum.DISPATCHED))).scalar() or 0
            completed = (await db.execute(select(func.count(Trip.id)).where(Trip.status == TripStatusEnum.COMPLETED))).scalar() or 0
            cancelled = (await db.execute(select(func.count(Trip.id)).where(Trip.status == TripStatusEnum.CANCELLED))).scalar() or 0
            
            await _upsert_stat(db, "total_trips", total)
            await _upsert_stat(db, "active_trips", active)
            await _upsert_stat(db, "completed_trips", completed)
            await _upsert_stat(db, "cancelled_trips", cancelled)
            
            await db.commit()
        except Exception as e:
            print(f"Error recalculating trip stats: {e}")

async def recalculate_financial_stats():
    """Background task to recalculate financial and expense stats."""
    async with AsyncSessionLocal() as db:
        try:
            # Total operational cost (Fuel + Maintenance + Tolls + Trip + Other)
            op_cost_q = select(func.sum(Expense.amount))
            total_op_cost = (await db.execute(op_cost_q)).scalar() or 0.0
            
            # Total fuel cost
            fuel_cost_q = select(func.sum(Expense.amount)).where(Expense.type == ExpenseTypeEnum.FUEL)
            total_fuel_cost = (await db.execute(fuel_cost_q)).scalar() or 0.0
            
            # Total trip cost
            trip_cost_q = select(func.sum(Expense.amount)).where(Expense.type == ExpenseTypeEnum.TRIP_COST)
            total_trip_cost = (await db.execute(trip_cost_q)).scalar() or 0.0
            
            # Total maintenance cost
            maint_cost_q = select(func.sum(Expense.amount)).where(Expense.type == ExpenseTypeEnum.MAINTENANCE)
            total_maintenance_cost = (await db.execute(maint_cost_q)).scalar() or 0.0
            
            # We don't have Revenue tracked yet in the basic spec, so ROI will assume 0 revenue or some mock
            # Vehicle ROI = [ Revenue - (Maintenance + Fuel) ] / Acquisition Cost
            # For fleet level, we can just sum up costs and track it.
            
            await _upsert_stat(db, "total_operational_cost", float(total_op_cost))
            await _upsert_stat(db, "total_fuel_cost", float(total_fuel_cost))
            await _upsert_stat(db, "total_trip_cost", float(total_trip_cost))
            await _upsert_stat(db, "total_maintenance_cost", float(total_maintenance_cost))
            
            await db.commit()
        except Exception as e:
            print(f"Error recalculating financial stats: {e}")
