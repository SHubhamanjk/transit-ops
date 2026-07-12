import asyncio
from app.db.database import engine, Base
from app.db.models.user import User
from app.db.models.driver import Driver
from app.db.models.vehicle import Vehicle
from app.db.models.trip import Trip
from app.db.models.maintenance import MaintenanceLog
from app.db.models.expense import Expense
from app.db.models.dashboard_stats import DashboardStat

async def init_db():
    async with engine.begin() as conn:
        print("Dropping all tables...")
        await conn.run_sync(Base.metadata.drop_all)
        print("Creating all tables...")
        await conn.run_sync(Base.metadata.create_all)
    print("Database initialization complete.")

if __name__ == "__main__":
    asyncio.run(init_db())
