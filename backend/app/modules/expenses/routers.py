from fastapi import APIRouter, Depends, Query, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.db.database import get_db
from app.db.models.user import User, RoleEnum
from app.modules.auth.utils import get_current_user, require_role
from app.modules.expenses.schemas import ExpenseCreate, ExpenseResponse
from app.modules.expenses import services

router = APIRouter(prefix="/expenses", tags=["Expenses"])

@router.get("/", response_model=List[ExpenseResponse])
async def list_expenses(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, le=100),
    vehicle_id: Optional[str] = None,
    trip_id: Optional[str] = None,
    type: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List expenses with optional filters."""
    return await services.get_expenses(db, skip=skip, limit=limit, vehicle_id=vehicle_id, trip_id=trip_id, type_filter=type)

@router.post("/", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
async def create_expense_log(
    expense_in: ExpenseCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([RoleEnum.FLEET_MANAGER, RoleEnum.FINANCIAL_ANALYST, RoleEnum.DRIVER]))
):
    """Create a general expense or fuel log."""
    return await services.create_expense(db, expense_in, background_tasks)
