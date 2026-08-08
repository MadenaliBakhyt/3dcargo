"""Internal (non-pydantic) data structures used by the packing engine.

Kept separate from the API schemas so the hot packing loop works with plain
dataclasses instead of paying Pydantic validation overhead on every access.
"""

from dataclasses import dataclass, field


@dataclass
class Instance:
    """A single physical cargo item (one unit out of a CargoType's quantity)."""

    instance_id: str
    cargo_type_id: str
    name: str

    length: float
    width: float
    height: float
    weight: float

    color: str
    package_type: str
    priority: str

    allow_rotation: bool
    allow_vertical_rotation: bool
    stackable: bool
    max_stack_height: float | None
    max_stack_tiers: int | None
    fragile: bool
    max_top_load: float | None

    @property
    def volume(self) -> float:
        return self.length * self.width * self.height

    @property
    def base_area(self) -> float:
        return self.length * self.width


@dataclass
class PlacedItem:
    instance: Instance
    truck_id: str

    x: float
    y: float
    z: float

    length: float
    width: float
    height: float

    rotation: dict
    orientation_code: str

    tier: int
    loading_order: int
    supported_by: list[str] = field(default_factory=list)

    # running total of weight stacked on top of this item (for max_top_load checks)
    load_on_top: float = 0.0

    @property
    def x2(self) -> float:
        return self.x + self.length

    @property
    def y2(self) -> float:
        return self.y + self.width

    @property
    def z2(self) -> float:
        return self.z + self.height

    @property
    def volume(self) -> float:
        return self.length * self.width * self.height


@dataclass
class UnplacedInstance:
    instance: Instance
    reason: str
