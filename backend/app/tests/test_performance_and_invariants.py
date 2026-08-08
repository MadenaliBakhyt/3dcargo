"""TEST 15: performance with 500+ cargo items. Also verifies the required
invariants (no overlap, no out-of-bounds, no weight violation, no invalid
support/stacking) hold across representative scenarios."""

import time

from app.algorithms.bin_packing import run_packing
from app.schemas.cargo import CargoType
from app.services.validation_service import validate_result


def test_500_plus_cargo_items_completes_and_is_valid(euro_truck):
    cargo = CargoType(
        id="c1", name="Pallet", length=120, width=80, height=100, weight=200, quantity=550
    )
    start = time.time()
    result = run_packing([cargo], euro_truck, max_trucks=50)
    elapsed = time.time() - start

    total_placed = sum(len(t.items) for t in result.trucks)
    assert total_placed + len(result.unplaced) == 550
    assert elapsed < 60, f"Packing 550 items took too long: {elapsed:.1f}s"

    problems = validate_result(result.trucks, euro_truck)
    assert problems == []


def test_invariants_hold_for_mixed_cargo_scenario(euro_truck):
    pallet = CargoType(
        id="pallet-a", name="Pallet A", length=120, width=80, height=160, weight=450, quantity=15
    )
    box = CargoType(
        id="box-b",
        name="Box B",
        length=100,
        width=60,
        height=80,
        weight=120,
        quantity=30,
        stackable=True,
        priority="high",
    )
    result = run_packing([pallet, box], euro_truck)

    problems = validate_result(result.trucks, euro_truck)
    assert problems == []

    total_placed = sum(len(t.items) for t in result.trucks)
    assert total_placed + len(result.unplaced) == 45


def test_invariants_hold_with_rotation_and_stacking_mix():
    from app.schemas.transport import Transport

    truck = Transport(id="t", name="T", length=300, width=200, height=220, max_weight=15000)
    cargo_a = CargoType(
        id="a", name="A", length=90, width=60, height=70, weight=50, quantity=25,
        allow_rotation=True, allow_vertical_rotation=True, stackable=True, priority="high",
    )
    cargo_b = CargoType(
        id="b", name="B", length=120, width=100, height=40, weight=80, quantity=10,
        stackable=False, fragile=True, priority="low",
    )
    result = run_packing([cargo_a, cargo_b], truck)

    problems = validate_result(result.trucks, truck)
    assert problems == []
