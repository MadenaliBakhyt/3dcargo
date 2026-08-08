"""Weighted center-of-gravity calculation for a set of placed items."""

from app.algorithms.models import PlacedItem


def compute_center_of_gravity(
    items: list[PlacedItem], truck_length: float, truck_width: float, truck_height: float
) -> tuple[float, float, float, bool]:
    total_weight = sum(i.instance.weight for i in items)
    if total_weight <= 0 or not items:
        return 0.0, 0.0, 0.0, False

    cx = sum(i.instance.weight * (i.x + i.length / 2) for i in items) / total_weight
    cy = sum(i.instance.weight * (i.y + i.width / 2) for i in items) / total_weight
    cz = sum(i.instance.weight * (i.z + i.height / 2) for i in items) / total_weight

    # Warn if the center of gravity is meaningfully off-center on the
    # horizontal axes (lengthwise / widthwise), which can affect axle load
    # distribution and vehicle stability.
    x_offset_ratio = abs(cx - truck_length / 2) / (truck_length / 2) if truck_length else 0
    y_offset_ratio = abs(cy - truck_width / 2) / (truck_width / 2) if truck_width else 0
    offset_warning = x_offset_ratio > 0.25 or y_offset_ratio > 0.25

    return cx, cy, cz, offset_warning
