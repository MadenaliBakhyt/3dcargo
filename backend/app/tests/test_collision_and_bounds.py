"""TEST 12-13: AABB collision detection and boundary detection."""

from app.algorithms.bin_packing import run_packing
from app.algorithms.collision import SpatialGrid, aabb_overlap
from app.schemas.cargo import CargoType
from app.schemas.transport import Transport


def test_aabb_overlap_detects_intersection():
    assert aabb_overlap(0, 0, 0, 10, 10, 10, 5, 5, 5, 15, 15, 15) is True


def test_aabb_overlap_detects_no_intersection():
    assert aabb_overlap(0, 0, 0, 10, 10, 10, 10, 10, 10, 20, 20, 20) is False  # touching, not overlapping
    assert aabb_overlap(0, 0, 0, 10, 10, 10, 50, 50, 50, 60, 60, 60) is False


def test_spatial_grid_collision_query():
    grid = SpatialGrid(cell_size=25)

    class Fake:
        def __init__(self, x, y, z, x2, y2, z2):
            self.x, self.y, self.z, self.x2, self.y2, self.z2 = x, y, z, x2, y2, z2

    grid.insert(Fake(0, 0, 0, 50, 50, 50))
    assert grid.has_collision(10, 10, 10, 20, 20, 20) is True
    assert grid.has_collision(100, 100, 100, 120, 120, 120) is False


def test_item_placed_exactly_at_truck_boundary_fits():
    truck = Transport(id="t", name="T", length=100, width=100, height=100, max_weight=10000)
    cargo = CargoType(id="c1", name="Exact Fit", length=100, width=100, height=100, weight=10, quantity=1)
    result = run_packing([cargo], truck)

    assert len(result.unplaced) == 0
    item = result.trucks[0].items[0]
    assert item.x + item.length == 100
    assert item.y + item.width == 100
    assert item.z + item.height == 100


def test_item_slightly_larger_than_truck_does_not_fit():
    truck = Transport(id="t", name="T", length=100, width=100, height=100, max_weight=10000)
    cargo = CargoType(id="c1", name="Too Big", length=100.5, width=100, height=100, weight=10, quantity=1)
    result = run_packing([cargo], truck)

    assert len(result.trucks) == 0
    assert len(result.unplaced) == 1
