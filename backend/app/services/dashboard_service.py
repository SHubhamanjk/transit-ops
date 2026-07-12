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
            # Count total vehicles
            total_q = select(func.count(Vehicle.id))
            total = (await db.execute(total_q)).scalar() or 0
            
            # Count active vehicles (AVAILABLE or ON_TRIP)
            active_q = select(func.count(Vehicle.id)).where(Vehicle.status.in_([VehicleStatusEnum.AVAILABLE, VehicleStatusEnum.ON_TRIP]))
            active = (await db.execute(active_q)).scalar() or 0
            
            # Count in-shop vehicles
            in_shop_q = select(func.count(Vehicle.id)).where(Vehicle.status == VehicleStatusEnum.IN_SHOP)
            in_shop = (await db.execute(in_shop_q)).scalar() or 0
            
            # Calculate utilization (Active / Total)
            utilization = (active / total * 100) if total > 0 else 0.0
            
            await _upsert_stat(db, "total_vehicles", total)
            await _upsert_stat(db, "active_vehicles", active)
            await _upsert_stat(db, "vehicles_in_shop", in_shop)
            await _upsert_stat(db, "fleet_utilization", float(round(utilization, 2)))
            
            await db.commit()
        except Exception as e:
            print(f"Error recalculating vehicle stats: {e}")

async def recalculate_driver_stats():
    """Background task to recalculate driver-related stats."""
    async with AsyncSessionLocal() as db:
        try:
            # Count suspended drivers
            suspended_q = select(func.count(Driver.id)).where(Driver.status == DriverStatusEnum.SUSPENDED)
            suspended = (await db.execute(suspended_q)).scalar() or 0
            
            # Average safety score
            avg_safety_q = select(func.avg(Driver.safety_score))
            avg_safety = (await db.execute(avg_safety_q)).scalar() or 100.0
            
            await _upsert_stat(db, "suspended_drivers", suspended)
            await _upsert_stat(db, "average_safety_score", float(round(avg_safety, 2)))
            
            await db.commit()
        except Exception as e:
            print(f"Error recalculating driver stats: {e}")

async def recalculate_trip_stats():
    """Background task to recalculate trip-related stats."""
    async with AsyncSessionLocal() as db:
        try:
            # Count active trips
            active_q = select(func.count(Trip.id)).where(Trip.status == TripStatusEnum.DISPATCHED)
            active = (await db.execute(active_q)).scalar() or 0
            
            await _upsert_stat(db, "active_trips", active)
            
            # Recalculate driver specific active trips (if needed globally, otherwise we can skip for now)
            
            await db.commit()
        except Exception as e:
            print(f"Error recalculating trip stats: {e}")

async def recalculate_financial_stats():
    """Background task to recalculate financial and expense stats."""
    async with AsyncSessionLocal() as db:
        try:
            # Total operational cost (Fuel + Maintenance + Tolls + Other)
            op_cost_q = select(func.sum(Expense.amount))
            total_op_cost = (await db.execute(op_cost_q)).scalar() or 0.0
            
            # Total fuel cost
            fuel_cost_q = select(func.sum(Expense.amount)).where(Expense.type == ExpenseTypeEnum.FUEL)
            total_fuel_cost = (await db.execute(fuel_cost_q)).scalar() or 0.0
            
            # We don't have Revenue tracked yet in the basic spec, so ROI will assume 0 revenue or some mock
            # Vehicle ROI = [ Revenue - (Maintenance + Fuel) ] / Acquisition Cost
            # For fleet level, we can just sum up costs and track it.
            
            await _upsert_stat(db, "total_operational_cost", float(total_op_cost))
            await _upsert_stat(db, "total_fuel_cost", float(total_fuel_cost))
            
            await db.commit()
        except Exception as e:
            print(f"Error recalculating financial stats: {e}")
