from fastapi import FastAPI
from app.modules.auth.routers import router as auth_router
from app.modules.vehicles.routers import router as vehicles_router
from app.modules.drivers.routers import router as drivers_router


app = FastAPI(title="TransitOps API")

app.include_router(auth_router, prefix="/api")
app.include_router(vehicles_router, prefix="/api")
app.include_router(drivers_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "TransitOps API is running"}
