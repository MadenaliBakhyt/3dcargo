"""Scores a completed packing result so multiple heuristic runs can be
compared and the best one selected.

Priorities, in order: (1) fewest trucks, (2) fewest unplaced items,
(3) highest average volume utilization, (4) even weight distribution.
"""

from app.algorithms.models import PlacedItem, UnplacedInstance


def score_result(
    trucks_used: list[list[PlacedItem]],
    unplaced: list[UnplacedInstance],
    truck_volume: float,
    truck_max_weight: float,
) -> float:
    truck_count = len(trucks_used)
    if truck_count == 0:
        avg_volume_utilization = 0.0
        avg_weight_balance = 0.0
    else:
        utilizations = []
        weight_ratios = []
        for items in trucks_used:
            used_volume = sum(i.volume for i in items)
            used_weight = sum(i.instance.weight for i in items)
            utilizations.append(used_volume / truck_volume if truck_volume else 0)
            weight_ratios.append(used_weight / truck_max_weight if truck_max_weight else 0)
        avg_volume_utilization = sum(utilizations) / len(utilizations)
        avg_weight_balance = sum(weight_ratios) / len(weight_ratios)

    return (
        -truck_count * 1_000_000
        - len(unplaced) * 10_000
        + avg_volume_utilization * 1_000
        + avg_weight_balance * 100
    )
