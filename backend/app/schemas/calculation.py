from pydantic import Field

from app.schemas.cargo import CargoType
from app.schemas.common import CamelModel
from app.schemas.placement import (
    OverallStatistics,
    Placement,
    TruckStatistics,
    TruckSummary,
    UnplacedItem,
)
from app.schemas.transport import Transport


class CalculationSettings(CamelModel):
    max_trucks: int = Field(default=50, ge=1, le=500)
    support_ratio_threshold: float = Field(default=0.75, ge=0.1, le=1.0)


class CalculationRequest(CamelModel):
    transport: Transport
    cargo_types: list[CargoType]
    settings: CalculationSettings = CalculationSettings()


class CalculationResponse(CamelModel):
    success: bool
    trucks: list[TruckSummary]
    placements: list[Placement]
    statistics: OverallStatistics
    truck_statistics: list[TruckStatistics]
    unplaced: list[UnplacedItem]
    warnings: list[str]
