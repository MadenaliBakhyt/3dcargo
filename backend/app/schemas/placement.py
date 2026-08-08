from app.schemas.cargo import PackageType, Priority
from app.schemas.common import CamelModel


class Rotation(CamelModel):
    x: float = 0
    y: float = 0
    z: float = 0


class Placement(CamelModel):
    instance_id: str
    cargo_id: str
    cargo_name: str
    truck_id: str

    x: float
    y: float
    z: float

    length: float
    width: float
    height: float

    rotation: Rotation
    orientation_code: str

    weight: float
    color: str
    package_type: PackageType
    fragile: bool
    priority: Priority

    layer: int
    loading_order: int

    supported_by: list[str]


class UnplacedItem(CamelModel):
    instance_id: str
    cargo_type_id: str
    name: str
    reason: str


class CenterOfGravity(CamelModel):
    x: float
    y: float
    z: float
    offset_warning: bool = False


class TruckSummary(CamelModel):
    id: str
    name: str
    length: float
    width: float
    height: float
    max_weight: float


class TruckStatistics(CamelModel):
    truck_id: str
    placed_count: int
    total_weight: float
    total_volume_m3: float
    volume_utilization: float
    weight_utilization: float
    floor_utilization: float
    free_volume_m3: float
    center_of_gravity: CenterOfGravity


class OverallStatistics(CamelModel):
    truck_count: int
    total_cargo_items: int
    placed_items: int
    unplaced_items: int
    total_weight: float
    total_volume_m3: float
    volume_utilization: float
    weight_utilization: float
