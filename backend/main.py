from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.modules.auth.routers import router as auth_router
from app.modules.vehicles.routers import router as vehicles_router
from app.modules.drivers.routers import router as drivers_router
from app.modules.trips.routers import router as trips_router
from app.modules.maintenance.routers import router as maintenance_router
from app.modules.expenses.routers import router as expenses_router
from app.modules.dashboard.routers import router as dashboard_router

app = FastAPI(title="TransitOps API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(vehicles_router, prefix="/api")
app.include_router(drivers_router, prefix="/api")
app.include_router(trips_router, prefix="/api")
app.include_router(maintenance_router, prefix="/api")
app.include_router(expenses_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "TransitOps API is running"}
