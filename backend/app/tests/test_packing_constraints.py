"""TEST 7-11: weight limits, multiple trucks, stacking allowed/prohibited,
and fragile cargo."""

from app.algorithms.bin_packing import run_packing
from app.schemas.cargo import CargoType
from app.schemas.transport import Transport


def test_weight_limit_forces_multiple_trucks():
    truck = Transport(id="t", name="T", length=1000, width=1000, height=1000, max_weight=1000)
    # 20 items x 100kg = 2000kg total, way over a single truck's 1000kg cap,
    # but each item is tiny so space is never the limiting factor.
    cargo = CargoType(
        id="c1", name="Heavy", length=10, width=10, height=10, weight=100, quantity=20
    )
    result = run_packing([cargo], truck)

    assert len(result.unplaced) == 0
    assert len(result.trucks) >= 2
    for t in result.trucks:
        total_weight = sum(i.instance.weight for i in t.items)
        assert total_weight <= truck.max_weight


def test_multiple_trucks_used_when_space_runs_out():
    truck = Transport(id="t", name="T", length=100, width=100, height=100, max_weight=100000)
    cargo = CargoType(id="c1", name="Box", length=50, width=50, height=50, weight=1, quantity=20)
    result = run_packing([cargo], truck)

    assert len(result.unplaced) == 0
    total_placed = sum(len(t.items) for t in result.trucks)
    assert total_placed == 20
    assert len(result.trucks) >= 3  # 8 items fit per truck (2x2x2), so 20 needs 3 trucks


def test_stacking_allowed_produces_stacked_items():
    truck = Transport(id="t", name="T", length=60, width=60, height=200, max_weight=10000)
    cargo = CargoType(
        id="c1", name="Box", length=60, width=60, height=50, weight=10, quantity=3, stackable=True
    )
    result = run_packing([cargo], truck)

    assert len(result.unplaced) == 0
    items = result.trucks[0].items
    assert any(item.z > 0 for item in items)


def test_stacking_prohibited_keeps_everything_on_the_floor():
    truck = Transport(id="t", name="T", length=60, width=60, height=200, max_weight=10000)
    cargo = CargoType(
        id="c1", name="Box", length=60, width=60, height=50, weight=10, quantity=3, stackable=False
    )
    result = run_packing([cargo], truck)

    # Floor only fits 1 item; stacking is prohibited, so extras must overflow
    # into additional trucks rather than being stacked.
    for t in result.trucks:
        assert all(item.z == 0 for item in t.items)


def test_fragile_cargo_blocks_stacking_on_top():
    truck = Transport(id="t", name="T", length=50, width=50, height=200, max_weight=10000)
    fragile_cargo = CargoType(
        id="c1", name="Fragile Box", length=50, width=50, height=50,
        weight=10, quantity=1, fragile=True,
    )
    other_cargo = CargoType(
        id="c2", name="Other Box", length=50, width=50, height=50, weight=10, quantity=1
    )
    # max_trucks=1 forces the second item to either stack on the fragile item
    # or be reported unplaced -- it must NOT be placed on top of the fragile one.
    result = run_packing([fragile_cargo, other_cargo], truck, max_trucks=1)

    placed_ids = {item.instance.instance_id for t in result.trucks for item in t.items}
    assert "c1-001" in placed_ids
    for t in result.trucks:
        for item in t.items:
            if item.instance.instance_id == "c2-001":
                assert "c1-001" not in item.supported_by
    if "c2-001" not in placed_ids:
        unplaced_ids = {u.instance.instance_id for u in result.unplaced}
        assert "c2-001" in unplaced_ids
