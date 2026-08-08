"""Physical support and stacking-rule validation.

An item may only be placed if its base is adequately supported (by the
floor and/or the tops of already-placed items — no "floating" cargo), and
if placing it doesn't violate the rules of whatever it rests on: fragility,
stackability, tier limits, stack-height limits, and top-load capacity.
"""

from dataclasses import dataclass

from app.algorithms.collision import SpatialGrid
from app.algorithms.models import Instance, PlacedItem

FLOOR = "floor"
EPS = 1e-6


@dataclass
class SupportResult:
    supported: bool
    support_ids: list[str]
    tier: int


def find_support(
    grid: SpatialGrid, x: float, y: float, z: float, length: float, width: float,
    support_ratio_threshold: float,
) -> SupportResult:
    base_area = length * width
    x2, y2 = x + length, y + width

    if z <= EPS:
        return SupportResult(supported=True, support_ids=[FLOOR], tier=1)

    supporters = grid.items_with_top_near(x, y, x2, y2, z)
    if not supporters:
        return SupportResult(supported=False, support_ids=[], tier=0)

    covered_area = 0.0
    support_ids: list[str] = []
    max_tier = 0
    for item in supporters:
        ox1, oy1, ox2, oy2 = max(x, item.x), max(y, item.y), min(x2, item.x2), min(y2, item.y2)
        overlap = max(0.0, ox2 - ox1) * max(0.0, oy2 - oy1)
        if overlap > EPS:
            covered_area += overlap
            support_ids.append(item.instance.instance_id)
            max_tier = max(max_tier, item.tier)

    ratio = covered_area / base_area if base_area > 0 else 0
    if ratio + EPS < support_ratio_threshold or not support_ids:
        return SupportResult(supported=False, support_ids=[], tier=0)

    return SupportResult(supported=True, support_ids=support_ids, tier=max_tier + 1)


def validate_stacking_rules(
    candidate: Instance, z2: float, support: SupportResult, placed_by_id: dict[str, PlacedItem]
) -> str | None:
    """Returns None if the stacking rules are satisfied, otherwise a reason string."""
    if support.support_ids == [FLOOR]:
        return None

    for support_id in support.support_ids:
        support_item = placed_by_id[support_id]
        support_instance = support_item.instance

        if support_instance.fragile:
            return f"нельзя размещать груз на хрупком грузе {support_instance.name}"

        if not support_instance.stackable:
            return f"груз {support_instance.name} не допускает штабелирование"

        if support_instance.max_stack_tiers is not None and support.tier > support_instance.max_stack_tiers:
            return f"превышено максимальное количество ярусов для {support_instance.name}"

        if support_instance.max_stack_height is not None and z2 > support_instance.max_stack_height + EPS:
            return f"превышена максимальная высота штабеля для {support_instance.name}"

        if support_instance.max_top_load is not None:
            if support_item.load_on_top + candidate.weight > support_instance.max_top_load + EPS:
                return f"превышена допустимая нагрузка сверху на {support_instance.name}"

    return None


def propagate_top_load(support_ids: list[str], weight: float, placed_by_id: dict[str, PlacedItem]) -> None:
    """Adds `weight` to the load-on-top counter of every item in the support
    chain, walking all the way down to the floor, so an item's top-load limit
    reflects everything stacked above it (not just what rests directly on it)."""
    visited: set[str] = set()
    frontier = [sid for sid in support_ids if sid != FLOOR]
    while frontier:
        sid = frontier.pop()
        if sid in visited or sid == FLOOR:
            continue
        visited.add(sid)
        item = placed_by_id.get(sid)
        if item is None:
            continue
        item.load_on_top += weight
        frontier.extend(s for s in item.supported_by if s != FLOOR and s not in visited)
