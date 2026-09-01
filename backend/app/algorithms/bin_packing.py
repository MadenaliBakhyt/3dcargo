"""Core 3D bin packing orchestrator.

Pipeline: expand quantities -> filter physically-impossible cargo -> run a
handful of fast heuristic strategies (varying sort order and placement
strategy) -> score each full result -> keep the best one.

Each strategy uses the same placement primitives (candidate points, AABB
collision via a spatial grid, physical-support checking, stacking-rule
validation) so behaviour stays consistent; only *which item goes first* and
*how thoroughly candidate placements are compared* changes between them.
"""

from dataclasses import dataclass

from app.algorithms.candidate_points import CandidatePoints
from app.algorithms.center_of_gravity import compute_center_of_gravity
from app.algorithms.collision import SpatialGrid
from app.algorithms.models import Instance, PlacedItem, UnplacedInstance
from app.algorithms.rotations import get_orientations
from app.algorithms.scoring import score_result
from app.algorithms.stacking import find_support, propagate_top_load, validate_stacking_rules
from app.schemas.cargo import CargoType
from app.schemas.transport import Transport

EPS = 1e-6
PRIORITY_RANK = {"high": 0, "medium": 1, "low": 2}
BEST_FIT_POINT_CAP = 300
# Above this many items, exhaustive "best fit" comparisons get too expensive;
# fall back to cheaper first-fit-only strategies to keep response times sane.
BEST_FIT_ITEM_LIMIT = 400


@dataclass
class Truck:
    id: str
    name: str
    grid: SpatialGrid
    points: CandidatePoints
    items: list[PlacedItem]
    placed_by_id: dict[str, PlacedItem]
    weight_used: float = 0.0


@dataclass
class Strategy:
    name: str
    key: object  # callable(Instance) -> sort key
    mode: str  # "first_fit" | "best_fit"


def expand_instances(cargo_types: list[CargoType]) -> list[Instance]:
    instances: list[Instance] = []
    for ct in cargo_types:
        for i in range(1, ct.quantity + 1):
            instances.append(
                Instance(
                    instance_id=f"{ct.id}-{i:03d}",
                    cargo_type_id=ct.id,
                    name=ct.name,
                    length=ct.length,
                    width=ct.width,
                    height=ct.height,
                    weight=ct.weight,
                    color=ct.color,
                    package_type=ct.package_type.value,
                    priority=ct.priority.value,
                    allow_rotation=ct.allow_rotation,
                    allow_vertical_rotation=ct.allow_vertical_rotation,
                    stackable=ct.stackable,
                    max_stack_height=ct.max_stack_height,
                    max_stack_tiers=ct.max_stack_tiers,
                    fragile=ct.fragile,
                    max_top_load=ct.max_top_load,
                )
            )
    return instances


def filter_impossible(
    instances: list[Instance], transport: Transport
) -> tuple[list[Instance], list[UnplacedInstance]]:
    fittable: list[Instance] = []
    impossible: list[UnplacedInstance] = []

    for inst in instances:
        weight_ok = inst.weight <= transport.max_weight + EPS
        orientations = get_orientations(
            inst.length, inst.width, inst.height, inst.allow_rotation, inst.allow_vertical_rotation
        )
        fits_any_orientation = any(
            o.length <= transport.length + EPS
            and o.width <= transport.width + EPS
            and o.height <= transport.height + EPS
            for o in orientations
        )

        if weight_ok and fits_any_orientation:
            fittable.append(inst)
        elif not weight_ok and not fits_any_orientation:
            impossible.append(
                UnplacedInstance(inst, "размер и вес груза превышают возможности транспорта")
            )
        elif not weight_ok:
            impossible.append(
                UnplacedInstance(inst, "вес груза превышает грузоподъёмность транспорта")
            )
        else:
            impossible.append(
                UnplacedInstance(inst, "размер груза превышает внутренние размеры транспорта")
            )

    return fittable, impossible


def _check_and_build(
    inst: Instance,
    point: tuple[float, float, float],
    orientation,
    truck: Truck,
    transport: Transport,
    support_ratio_threshold: float,
    loading_order: int,
) -> PlacedItem | None:
    x, y, z = point
    length, width, height = orientation.length, orientation.width, orientation.height

    if x < -EPS or y < -EPS or z < -EPS:
        return None
    if (
        x + length > transport.length + EPS
        or y + width > transport.width + EPS
        or z + height > transport.height + EPS
    ):
        return None
    if truck.weight_used + inst.weight > transport.max_weight + EPS:
        return None
    if truck.grid.has_collision(x, y, z, x + length, y + width, z + height):
        return None

    support = find_support(truck.grid, x, y, z, length, width, support_ratio_threshold)
    if not support.supported:
        return None

    reason = validate_stacking_rules(inst, z + height, support, truck.placed_by_id)
    if reason is not None:
        return None

    return PlacedItem(
        instance=inst,
        truck_id=truck.id,
        x=x,
        y=y,
        z=z,
        length=length,
        width=width,
        height=height,
        rotation=orientation.rotation,
        orientation_code=orientation.code,
        tier=support.tier,
        loading_order=loading_order,
        supported_by=support.support_ids,
    )


def _place_first_fit(
    inst: Instance,
    truck: Truck,
    transport: Transport,
    support_ratio_threshold: float,
    loading_order: int,
    prefer_stacking: bool = False,
) -> PlacedItem | None:
    orientations = get_orientations(
        inst.length, inst.width, inst.height, inst.allow_rotation, inst.allow_vertical_rotation
    )
    for point in truck.points.sorted_bottom_left_back(prefer_stacking):
        for orientation in orientations:
            placed = _check_and_build(
                inst, point, orientation, truck, transport, support_ratio_threshold, loading_order
            )
            if placed is not None:
                return placed
    return None


def _place_best_fit(
    inst: Instance,
    truck: Truck,
    transport: Transport,
    support_ratio_threshold: float,
    loading_order: int,
    prefer_stacking: bool = False,
) -> PlacedItem | None:
    orientations = get_orientations(
        inst.length, inst.width, inst.height, inst.allow_rotation, inst.allow_vertical_rotation
    )
    best: PlacedItem | None = None
    best_key: tuple | None = None
    z_sign = -1 if prefer_stacking else 1
    for point in truck.points.sorted_bottom_left_back(prefer_stacking)[:BEST_FIT_POINT_CAP]:
        for orientation in orientations:
            placed = _check_and_build(
                inst, point, orientation, truck, transport, support_ratio_threshold, loading_order
            )
            if placed is None:
                continue
            key = (z_sign * placed.z, placed.y, placed.x, placed.height)
            if best_key is None or key < best_key:
                best, best_key = placed, key
    return best


def _apply_placement(placed: PlacedItem, truck: Truck) -> None:
    truck.items.append(placed)
    truck.placed_by_id[placed.instance.instance_id] = placed
    truck.grid.insert(placed)
    truck.points.discard((placed.x, placed.y, placed.z))
    truck.points.add_from_placement(placed)
    truck.weight_used += placed.instance.weight
    propagate_top_load(placed.supported_by, placed.instance.weight, truck.placed_by_id)


def pack_single_strategy(
    sorted_instances: list[Instance],
    transport: Transport,
    mode: str,
    support_ratio_threshold: float,
    max_trucks: int,
    prefer_stacking: bool = False,
) -> tuple[list[Truck], list[UnplacedInstance]]:
    trucks: list[Truck] = []
    unplaced: list[UnplacedInstance] = []
    loading_order = 0
    place_fn = _place_best_fit if mode == "best_fit" else _place_first_fit

    for inst in sorted_instances:
        loading_order += 1
        placed = None
        for truck in trucks:
            if truck.weight_used + inst.weight > transport.max_weight + EPS:
                continue
            placed = place_fn(inst, truck, transport, support_ratio_threshold, loading_order, prefer_stacking)
            if placed is not None:
                _apply_placement(placed, truck)
                break

        if placed is not None:
            continue

        if len(trucks) >= max_trucks:
            unplaced.append(UnplacedInstance(inst, "достигнут лимит количества транспортных средств"))
            continue

        new_truck = Truck(
            id=f"truck-{len(trucks) + 1}",
            name=f"{transport.name} (машина {len(trucks) + 1})",
            grid=SpatialGrid(),
            points=CandidatePoints(),
            items=[],
            placed_by_id={},
        )
        placed = place_fn(inst, new_truck, transport, support_ratio_threshold, loading_order, prefer_stacking)
        if placed is not None:
            _apply_placement(placed, new_truck)
            trucks.append(new_truck)
        else:
            unplaced.append(
                UnplacedInstance(inst, "не удалось разместить с учётом ограничений опоры и штабелирования")
            )

    return trucks, unplaced


def build_strategies(item_count: int) -> list[Strategy]:
    def rank(inst: Instance) -> int:
        return PRIORITY_RANK.get(inst.priority, 1)

    strategies = [
        Strategy(
            "Largest Volume First (First Fit Decreasing)",
            lambda i: (rank(i), -i.volume, -i.base_area, -i.weight),
            "first_fit",
        ),
        Strategy(
            "Largest Base Area First",
            lambda i: (rank(i), -i.base_area, -i.volume, -i.weight),
            "first_fit",
        ),
        Strategy(
            "Bottom-Front-Left (Priority/Weight)",
            lambda i: (rank(i), -i.weight, -i.volume, -i.base_area),
            "first_fit",
        ),
    ]

    if item_count <= BEST_FIT_ITEM_LIMIT:
        strategies.append(
            Strategy(
                "Best Fit - Largest Volume First",
                lambda i: (rank(i), -i.volume, -i.base_area, -i.weight),
                "best_fit",
            )
        )
        strategies.append(
            Strategy(
                "Best Fit - Largest Base Area First",
                lambda i: (rank(i), -i.base_area, -i.volume, -i.weight),
                "best_fit",
            )
        )

    return strategies


def mirror_to_loading_side(trucks: list[Truck], truck_width: float, loading_side: str) -> None:
    """The packing loop always packs toward Y=0 (Bottom-*Left*-Back). For "right"
    this mirrors every placement across the truck's width so cargo instead hugs
    the Y=truck_width wall -- a rigid reflection, so it changes nothing about
    collision-freeness or support relationships (those are defined by instance
    IDs, not coordinates), it only changes which wall the load sits against.
    """
    if loading_side != "right":
        return
    for truck in trucks:
        for item in truck.items:
            item.y = truck_width - item.y - item.width


@dataclass
class PackingResult:
    trucks: list[Truck]
    unplaced: list[UnplacedInstance]
    strategy_used: str


def run_packing(
    cargo_types: list[CargoType],
    transport: Transport,
    max_trucks: int = 50,
    support_ratio_threshold: float = 0.75,
    loading_side: str = "left",
    prefer_stacking: bool = False,
) -> PackingResult:
    instances = expand_instances(cargo_types)
    fittable, impossible = filter_impossible(instances, transport)

    if not fittable:
        return PackingResult(trucks=[], unplaced=impossible, strategy_used="none")

    truck_volume = transport.length * transport.width * transport.height
    strategies = build_strategies(len(fittable))

    best_trucks: list[Truck] | None = None
    best_unplaced: list[UnplacedInstance] | None = None
    best_score = float("-inf")
    best_name = strategies[0].name

    for strategy in strategies:
        sorted_instances = sorted(fittable, key=strategy.key)
        trucks, unplaced = pack_single_strategy(
            sorted_instances, transport, strategy.mode, support_ratio_threshold, max_trucks, prefer_stacking
        )
        s = score_result(
            [t.items for t in trucks], unplaced, truck_volume, transport.max_weight
        )
        if s > best_score:
            best_score = s
            best_trucks = trucks
            best_unplaced = unplaced
            best_name = strategy.name

    assert best_trucks is not None and best_unplaced is not None
    mirror_to_loading_side(best_trucks, transport.width, loading_side)
    return PackingResult(
        trucks=best_trucks, unplaced=best_unplaced + impossible, strategy_used=best_name
    )


__all__ = [
    "run_packing",
    "PackingResult",
    "Truck",
    "compute_center_of_gravity",
]
