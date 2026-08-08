"""TEST 1-6: single item, identical items, row placement, layered stacking,
rotation, and cargo that physically cannot fit."""

from app.algorithms.bin_packing import run_packing
from app.schemas.cargo import CargoType
from app.schemas.transport import Transport


def test_single_small_cargo_item(small_truck):
    cargo = CargoType(id="c1", name="Box", length=50, width=50, height=50, weight=10, quantity=1)
    result = run_packing([cargo], small_truck)

    assert len(result.unplaced) == 0
    assert len(result.trucks) == 1
    assert len(result.trucks[0].items) == 1
    item = result.trucks[0].items[0]
    assert (item.x, item.y, item.z) == (0, 0, 0)
    assert (item.length, item.width, item.height) == (50, 50, 50)


def test_two_identical_cargo_items_no_overlap(small_truck):
    cargo = CargoType(id="c1", name="Box", length=50, width=50, height=50, weight=10, quantity=2)
    result = run_packing([cargo], small_truck)

    assert len(result.unplaced) == 0
    items = result.trucks[0].items
    assert len(items) == 2
    a, b = items
    overlap_x = a.x < b.x2 and b.x < a.x2
    overlap_y = a.y < b.y2 and b.y < a.y2
    overlap_z = a.z < b.z2 and b.z < a.z2
    assert not (overlap_x and overlap_y and overlap_z)


def test_multiple_cargo_placed_in_a_row(small_truck):
    cargo = CargoType(id="c1", name="Box", length=50, width=50, height=50, weight=10, quantity=4)
    result = run_packing([cargo], small_truck)

    assert len(result.unplaced) == 0
    items = sorted(result.trucks[0].items, key=lambda i: i.x)
    assert all(item.z == 0 for item in items)
    xs = [item.x for item in items]
    assert xs == sorted(set(xs))  # all distinct x positions, spread across the row


def test_cargo_placed_in_layers_when_floor_is_full():
    truck = Transport(id="t", name="T", length=100, width=100, height=200, max_weight=10000)
    cargo = CargoType(id="c1", name="Box", length=100, width=100, height=50, weight=10, quantity=4)
    result = run_packing([cargo], truck)

    assert len(result.unplaced) == 0
    items = result.trucks[0].items
    assert len(items) == 4
    tiers = sorted(item.z for item in items)
    assert tiers == [0, 50, 100, 150]
    for item in items:
        assert item.x == 0 and item.y == 0


def test_rotation_used_when_needed_to_fit():
    truck = Transport(id="t", name="T", length=100, width=150, height=100, max_weight=10000)
    cargo = CargoType(
        id="c1", name="Long Box", length=150, width=90, height=90, weight=10, quantity=1, allow_rotation=True
    )
    result = run_packing([cargo], truck)

    assert len(result.unplaced) == 0
    item = result.trucks[0].items[0]
    assert item.orientation_code == "WLH"
    assert (item.length, item.width, item.height) == (90, 150, 90)


def test_cargo_that_cannot_physically_fit(small_truck):
    cargo = CargoType(id="c1", name="Huge", length=500, width=500, height=500, weight=10, quantity=1)
    result = run_packing([cargo], small_truck)

    assert len(result.trucks) == 0
    assert len(result.unplaced) == 1
    assert "размер" in result.unplaced[0].reason
