from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status, BackgroundTasks
from app.db.models.expense import Expense, ExpenseTypeEnum
from app.db.models.vehicle import Vehicle
from app.db.models.trip import Trip
from app.modules.expenses.schemas import ExpenseCreate
from app.services.dashboard_service import recalculate_financial_stats

async def get_expenses(db: AsyncSession, skip: int = 0, limit: int = 10, vehicle_id: str = None, trip_id: str = None, type_filter: str = None):
    query = select(Expense)
    if vehicle_id:
        query = query.where(Expense.vehicle_id == vehicle_id)
    if trip_id:
        query = query.where(Expense.trip_id == trip_id)
    if type_filter:
        query = query.where(Expense.type == type_filter)
        
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

async def create_expense(db: AsyncSession, expense_in: ExpenseCreate, background_tasks: BackgroundTasks):
    vehicle_q = select(Vehicle).where(Vehicle.id == expense_in.vehicle_id)
    vehicle = (await db.execute(vehicle_q)).scalars().first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
        
    if expense_in.trip_id:
        trip_q = select(Trip).where(Trip.id == expense_in.trip_id)
        trip = (await db.execute(trip_q)).scalars().first()
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")

    new_expense = Expense(**expense_in.model_dump())
    db.add(new_expense)
    await db.commit()
    await db.refresh(new_expense)
    
    background_tasks.add_task(recalculate_financial_stats)
    return new_expense
