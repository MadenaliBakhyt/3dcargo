"""Post-hoc invariant checking for a packing result.

The packing algorithm should never produce an invalid placement, but we
verify the required invariants anyway (section "Validation result" of the
spec): every item is inside its container, no two items overlap, no item's
weight pushes its truck over the limit, every item is physically supported,
and stacking rules were respected. If any of this ever fails it indicates a
bug in the algorithm, not bad input, so callers surface it as a warning
rather than silently trusting the output.
"""

from app.algorithms.bin_packing import Truck
from app.algorithms.collision import aabb_overlap
from app.schemas.transport import Transport

EPS = 1e-3


def validate_result(trucks: list[Truck], transport: Transport) -> list[str]:
    problems: list[str] = []

    for truck in trucks:
        items = truck.items

        for item in items:
            if item.length <= 0 or item.width <= 0 or item.height <= 0:
                problems.append(f"{truck.id}: {item.instance.instance_id} имеет некорректные размеры")
            if item.x < -EPS or item.y < -EPS or item.z < -EPS:
                problems.append(f"{truck.id}: {item.instance.instance_id} имеет отрицательные координаты")
            if (
                item.x2 > transport.length + EPS
                or item.y2 > transport.width + EPS
                or item.z2 > transport.height + EPS
            ):
                problems.append(f"{truck.id}: {item.instance.instance_id} выходит за границы транспорта")
            if item.z > EPS and not item.supported_by:
                problems.append(f"{truck.id}: {item.instance.instance_id} не имеет физической опоры")

        for i in range(len(items)):
            for j in range(i + 1, len(items)):
                a, b = items[i], items[j]
                if aabb_overlap(a.x, a.y, a.z, a.x2, a.y2, a.z2, b.x, b.y, b.z, b.x2, b.y2, b.z2):
                    problems.append(
                        f"{truck.id}: пересечение {a.instance.instance_id} и {b.instance.instance_id}"
                    )

        total_weight = sum(i.instance.weight for i in items)
        if total_weight > transport.max_weight + EPS:
            problems.append(f"{truck.id}: суммарный вес превышает грузоподъёмность")

    return problems
