"""AABB collision detection with a uniform spatial grid for fast broad-phase
rejection, so we don't compare every new candidate box against every already
placed box (O(n) per check, O(n^2) overall) once truck loads get into the
thousands of items.
"""

from app.algorithms.models import PlacedItem

CELL_SIZE = 50.0  # cm


def aabb_overlap(
    ax1: float, ay1: float, az1: float, ax2: float, ay2: float, az2: float,
    bx1: float, by1: float, bz1: float, bx2: float, by2: float, bz2: float,
    eps: float = 1e-6,
) -> bool:
    """True if two axis-aligned boxes overlap on all three axes (with a small
    epsilon so touching faces don't count as a collision)."""
    if ax1 >= bx2 - eps or bx1 >= ax2 - eps:
        return False
    if ay1 >= by2 - eps or by1 >= ay2 - eps:
        return False
    if az1 >= bz2 - eps or bz1 >= az2 - eps:
        return False
    return True


class SpatialGrid:
    """Buckets placed items into fixed-size cells for fast region queries."""

    def __init__(self, cell_size: float = CELL_SIZE):
        self.cell_size = cell_size
        self._cells: dict[tuple[int, int, int], list[PlacedItem]] = {}

    def _cell_range(self, x1: float, y1: float, z1: float, x2: float, y2: float, z2: float):
        cs = self.cell_size
        return (
            range(int(x1 // cs), int(x2 // cs) + 1),
            range(int(y1 // cs), int(y2 // cs) + 1),
            range(int(z1 // cs), int(z2 // cs) + 1),
        )

    def insert(self, item: PlacedItem) -> None:
        rx, ry, rz = self._cell_range(item.x, item.y, item.z, item.x2, item.y2, item.z2)
        for cx in rx:
            for cy in ry:
                for cz in rz:
                    self._cells.setdefault((cx, cy, cz), []).append(item)

    def query(
        self, x1: float, y1: float, z1: float, x2: float, y2: float, z2: float
    ) -> list[PlacedItem]:
        rx, ry, rz = self._cell_range(x1, y1, z1, x2, y2, z2)
        found: dict[int, PlacedItem] = {}
        for cx in rx:
            for cy in ry:
                for cz in rz:
                    for item in self._cells.get((cx, cy, cz), []):
                        found[id(item)] = item
        return list(found.values())

    def has_collision(self, x1: float, y1: float, z1: float, x2: float, y2: float, z2: float) -> bool:
        for other in self.query(x1, y1, z1, x2, y2, z2):
            if aabb_overlap(
                x1, y1, z1, x2, y2, z2, other.x, other.y, other.z, other.x2, other.y2, other.z2
            ):
                return True
        return False

    def items_with_top_near(
        self, x1: float, y1: float, x2: float, y2: float, z: float, eps: float = 0.5
    ) -> list[PlacedItem]:
        """Placed items overlapping the given (x, y) footprint whose top surface
        sits at height `z` (used to find potential support surfaces)."""
        candidates = self.query(x1, y1, max(z - eps, 0), x2, y2, z + eps)
        return [item for item in candidates if abs(item.z2 - z) <= eps]
