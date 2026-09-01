"""Candidate placement points.

Instead of scanning every integer coordinate in the truck volume, we only
ever consider a small, growing set of "candidate points" — corners exposed
by items already placed (plus the origin). This is the standard technique
used by corner-point / extreme-point 3D bin packing heuristics and keeps the
algorithm fast even with thousands of items.
"""

from app.algorithms.models import PlacedItem


class CandidatePoints:
    def __init__(self):
        self._points: set[tuple[float, float, float]] = {(0.0, 0.0, 0.0)}

    def add_from_placement(self, item: PlacedItem) -> None:
        self._points.add((round(item.x2, 6), round(item.y, 6), round(item.z, 6)))
        self._points.add((round(item.x, 6), round(item.y2, 6), round(item.z, 6)))
        self._points.add((round(item.x, 6), round(item.y, 6), round(item.z2, 6)))

    def discard(self, point: tuple[float, float, float]) -> None:
        self._points.discard(point)

    def sorted_bottom_left_back(self) -> list[tuple[float, float, float]]:
        """Bottom-Front-Left order: lowest Z (closest to floor) first, then
        lowest X (closest to the front), then lowest Y (closest to the left
        wall). Prioritizing X before Y means the packer fills a row across
        the truck's *width* at the current front position before it ever
        advances further down the *length* -- matching how cargo is loaded
        in practice (side by side across the trailer, row by row down its
        length) instead of hugging one wall in a single line the full length
        of the truck before ever using the rest of the width.
        """
        return sorted(self._points, key=lambda p: (p[2], p[0], p[1]))
