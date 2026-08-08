from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.calculate import router as calculate_router

app = FastAPI(
    title="Cargo Loading Planner API",
    description="3D bin packing calculation service for cargo loading planning.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(calculate_router)


@app.get("/")
def root() -> dict:
    return {"name": "Cargo Loading Planner API", "docs": "/docs"}
