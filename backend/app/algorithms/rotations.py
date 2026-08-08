"""Generates the set of valid (length, width, height, rotation) orientations
for a cargo instance, respecting its rotation permissions.

Coordinate system: X = truck length, Y = truck width, Z = truck height (up).
An orientation assigns the item's original (L, W, H) edges to the (X, Y, Z)
axes. "Horizontal" rotation only swaps which edge faces X vs Y (the item
stays upright). "Vertical" rotation additionally allows edges to be
reassigned to the Z (height) axis, i.e. tipping the item onto its side.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class Orientation:
    length: float
    width: float
    height: float
    rotation: dict
    code: str


def get_orientations(length: float, width: float, height: float,
                      allow_rotation: bool, allow_vertical_rotation: bool) -> list[Orientation]:
    orientations = [Orientation(length, width, height, {"x": 0, "y": 0, "z": 0}, "LWH")]

    if allow_rotation:
        orientations.append(
            Orientation(width, length, height, {"x": 0, "y": 0, "z": 90}, "WLH")
        )

    if allow_vertical_rotation:
        orientations.extend(
            [
                Orientation(length, height, width, {"x": 90, "y": 0, "z": 0}, "LHW"),
                Orientation(height, width, length, {"x": 0, "y": 90, "z": 0}, "HWL"),
                Orientation(width, height, length, {"x": 90, "y": 0, "z": 90}, "WHL"),
                Orientation(height, length, width, {"x": 0, "y": 90, "z": 90}, "HLW"),
            ]
        )

    # De-duplicate orientations that yield identical bounding boxes (e.g. cubes,
    # or items with two equal edges) to avoid wasted work in the placement loop.
    seen: set[tuple[float, float, float]] = set()
    unique: list[Orientation] = []
    for o in orientations:
        key = (o.length, o.width, o.height)
        if key not in seen:
            seen.add(key)
            unique.append(o)
    return unique
