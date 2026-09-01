"""The prefer_stacking setting builds each stack as tall as possible before
starting a new floor footprint, instead of covering the floor in a single
layer first -- without ever violating per-item stacking rules."""

from app.algorithms.bin_packing import run_packing
from app.schemas.cargo import CargoType
from app.schemas.transport import Transport
from app.services.validation_service import validate_result


def test_default_behavior_covers_the_floor_before_stacking():
    truck = Transport(id="t", name="T", length=1000, width=1000, height=300, max_weight=50000)
    cargo = CargoType(id="c1", name="Box", length=50, width=50, height=50, weight=10, quantity=12, stackable=True)

    result = run_packing([cargo], truck, prefer_stacking=False)
    assert all(item.z == 0 for item in result.trucks[0].items)


def test_prefer_stacking_builds_a_tall_stack_before_a_new_footprint():
    truck = Transport(id="t", name="T", length=1000, width=1000, height=300, max_weight=50000)
    cargo = CargoType(id="c1", name="Box", length=50, width=50, height=50, weight=10, quantity=12, stackable=True)

    result = run_packing([cargo], truck, prefer_stacking=True)
    items = result.trucks[0].items

    # The truck fits 6 tiers of 50cm boxes (300 / 50); with only 12 boxes,
    # prefer_stacking should build one 6-tall column, then a second, and
    # never touch a third (x, y) footprint.
    footprints = {(item.x, item.y) for item in items}
    assert footprints == {(0, 0), (0, 50)}
    heights_at_origin = sorted(item.z for item in items if (item.x, item.y) == (0, 0))
    assert heights_at_origin == [0, 50, 100, 150, 200, 250]


def test_prefer_stacking_still_respects_non_stackable_cargo():
    truck = Transport(id="t", name="T", length=1000, width=1000, height=300, max_weight=50000)
    cargo = CargoType(
        id="c1", name="Box", length=50, width=50, height=50, weight=10, quantity=6, stackable=False
    )

    result = run_packing([cargo], truck, prefer_stacking=True)
    # stackable=False always wins regardless of the global preference.
    assert all(item.z == 0 for item in result.trucks[0].items)


def test_prefer_stacking_still_respects_max_stack_tiers():
    truck = Transport(id="t", name="T", length=1000, width=1000, height=300, max_weight=50000)
    cargo = CargoType(
        id="c1", name="Box", length=50, width=50, height=50, weight=10, quantity=6,
        stackable=True, max_stack_tiers=2,
    )

    result = run_packing([cargo], truck, prefer_stacking=True)
    items = result.trucks[0].items
    footprints = {(item.x, item.y) for item in items}
    # 6 boxes at 2 tiers max needs 3 footprints, not 1.
    assert len(footprints) == 3
    assert max(item.tier for item in items) == 2


def test_prefer_stacking_result_is_still_valid():
    truck = Transport(id="t", name="T", length=800, width=600, height=400, max_weight=30000)
    cargo_a = CargoType(
        id="a", name="A", length=60, width=50, height=40, weight=15, quantity=40, stackable=True, priority="high"
    )
    cargo_b = CargoType(
        id="b", name="B", length=80, width=60, height=60, weight=25, quantity=15, stackable=True,
        max_stack_tiers=3, fragile=False,
    )
    result = run_packing([cargo_a, cargo_b], truck, prefer_stacking=True)
    assert validate_result(result.trucks, truck) == []
