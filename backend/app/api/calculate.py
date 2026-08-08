from fastapi import APIRouter, HTTPException

from app.schemas.calculation import CalculationRequest, CalculationResponse
from app.services.calculation_service import CalculationError, calculate

router = APIRouter(prefix="/api", tags=["calculation"])


@router.post("/calculate", response_model=CalculationResponse)
def calculate_endpoint(request: CalculationRequest) -> CalculationResponse:
    try:
        return calculate(request)
    except CalculationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/health")
def health() -> dict:
    return {"status": "ok"}
