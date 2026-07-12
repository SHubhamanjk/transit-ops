from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.modules.auth.schemas import UserCreate, UserResponse, LoginInitiate, LoginConfirm, TokenResponse, ForgotPassword, ResetPassword, RefreshTokenRequest
from app.modules.auth import services
from app.modules.auth.utils import get_current_user
from app.db.models.user import User
from app.db.models.dashboard_stats import DashboardStat
from app.db.models.driver import Driver
from sqlalchemy.future import select
from app.modules.auth import services

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """Registers a new user"""
    return await services.create_user(db, user_in)

@router.post("/login/initiate")
async def login_initiate(creds: LoginInitiate, db: AsyncSession = Depends(get_db)):
    """Validates credentials and generates an OTP sent to email."""
    return await services.initiate_login(db, creds.email, creds.password)

@router.post("/login/confirm", response_model=TokenResponse)
async def login_confirm(confirm_data: LoginConfirm, db: AsyncSession = Depends(get_db)):
    return await services.confirm_login(db, confirm_data.email, confirm_data.otp_code)

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(data: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """Exchanges a valid refresh token for a new access token."""
    return await services.refresh_access_token(db, data.refresh_token)

@router.post("/forgot-password")
async def forgot_password(data: ForgotPassword, db: AsyncSession = Depends(get_db)):
    """Initiates password reset flow by sending OTP to email."""
    return await services.forgot_password(db, data.email)

@router.post("/reset-password")
async def reset_password(data: ResetPassword, db: AsyncSession = Depends(get_db)):
    """Validates OTP and resets password."""
    return await services.reset_password(db, data.email, data.otp_code, data.new_password)

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stats = {}
    if current_user.role == "DRIVER":
        # Fetch Driver record
        driver_query = select(Driver).where(Driver.user_id == current_user.id)
        driver_result = await db.execute(driver_query)
        driver = driver_result.scalars().first()
        
        if driver:
            # Fetch precalculated active trips for this driver
            stat_id = f"driver_{driver.id}_active_trips"
            stat_query = select(DashboardStat).where(DashboardStat.id == stat_id)
            stat_result = await db.execute(stat_query)
            active_trips_stat = stat_result.scalars().first()
            active_trips = int(active_trips_stat.value) if active_trips_stat else 0
            
            stats = {
                "safety_score": float(driver.safety_score),
                "status": driver.status,
                "active_trips": active_trips
            }
        else:
            stats = {"error": "Driver profile not found"}
            
    elif current_user.role == "FLEET_MANAGER":
        # Fetch precalculated stats relevant to fleet manager
        stats_query = select(DashboardStat).where(DashboardStat.id.in_([
            "active_vehicles", "vehicles_in_shop", "total_vehicles", "active_trips", "fleet_utilization"
        ]))
        stats_result = await db.execute(stats_query)
        
        stats = {
            "active_vehicles": 0, "vehicles_in_shop": 0, "total_vehicles": 0, 
            "active_trips": 0, "fleet_utilization": 0.0
        }
        for stat in stats_result.scalars().all():
            stats[stat.id] = stat.value
            
    elif current_user.role == "SAFETY_OFFICER":
        stats_query = select(DashboardStat).where(DashboardStat.id.in_([
            "suspended_drivers", "average_safety_score", "expiring_licenses"
        ]))
        stats_result = await db.execute(stats_query)
        
        stats = {
            "suspended_drivers": 0, "average_safety_score": 100.0, "expiring_licenses": 0
        }
        for stat in stats_result.scalars().all():
            stats[stat.id] = stat.value
            
    elif current_user.role == "FINANCIAL_ANALYST":
        stats_query = select(DashboardStat).where(DashboardStat.id.in_([
            "total_operational_cost", "total_fuel_cost", "fleet_roi"
        ]))
        stats_result = await db.execute(stats_query)
        
        stats = {
            "total_operational_cost": 0.0, "total_fuel_cost": 0.0, "fleet_roi": 0.0
        }
        for stat in stats_result.scalars().all():
            stats[stat.id] = stat.value
        
    return {
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "role": current_user.role
        },
        "stats": stats
    }
