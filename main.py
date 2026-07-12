from fastapi import FastAPI

app = FastAPI(title="TransitOps API")

@app.get("/")
async def root():
    return {"message": "TransitOps API is running"}
