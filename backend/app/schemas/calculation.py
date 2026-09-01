from enum import Enum

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


class LoadingSide(str, Enum):
    """Which side (looking into the vehicle from the open rear doors) cargo is
    packed against. Purely a Y-axis mirror of an otherwise identical
    placement -- lets the plan match which side is the driver's side for a
    given fleet/country without changing the packing algorithm itself."""

    LEFT = "left"
    RIGHT = "right"


class LoadingDirection(str, Enum):
    """Which end along the vehicle's length cargo is packed against. "front"
    (default) hugs the cab end (X=0); "back" hugs the open rear doors. Purely
    an X-axis mirror, same reasoning as LoadingSide."""

    FRONT = "front"
    BACK = "back"


class CalculationSettings(CamelModel):
    max_trucks: int = Field(default=50, ge=1, le=500)
    support_ratio_threshold: float = Field(default=0.75, ge=0.1, le=1.0)
    loading_side: LoadingSide = LoadingSide.LEFT
    loading_direction: LoadingDirection = LoadingDirection.FRONT


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
