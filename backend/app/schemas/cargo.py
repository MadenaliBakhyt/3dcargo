from enum import Enum

from pydantic import Field, model_validator

from app.schemas.common import CamelModel


class PackageType(str, Enum):
    BOX = "box"
    PALLET = "pallet"
    CRATE = "crate"
    BARREL = "barrel"
    SACK = "sack"
    PALLETIZED = "palletized"
    NON_STANDARD = "non_standard"
    OTHER = "other"


class Priority(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class CargoType(CamelModel):
    """A cargo type as configured by the user, before quantity expansion."""

    id: str
    name: str
    length: float = Field(gt=0)
    width: float = Field(gt=0)
    height: float = Field(gt=0)
    weight: float = Field(ge=0)
    quantity: int = Field(ge=1)
    color: str = "#ef4444"
    package_type: PackageType = PackageType.BOX
    allow_rotation: bool = True
    allow_vertical_rotation: bool = False
    stackable: bool = True
    max_stack_height: float | None = Field(default=None, gt=0)
    max_stack_tiers: int | None = Field(default=None, ge=1)
    fragile: bool = False
    max_top_load: float | None = Field(default=None, ge=0)
    priority: Priority = Priority.MEDIUM
    description: str = ""

    @model_validator(mode="after")
    def fragile_implies_no_top_load(self) -> "CargoType":
        if self.fragile and self.max_top_load is None:
            self.max_top_load = 0
        return self

    @property
    def volume_m3(self) -> float:
        return (self.length * self.width * self.height) / 1_000_000

    @property
    def base_area(self) -> float:
        return self.length * self.width
