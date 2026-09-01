"""The loading-side setting mirrors placements across the truck's width
without changing anything about validity (collisions, bounds, support)."""

from app.algorithms.bin_packing import run_packing
from app.schemas.cargo import CargoType
from app.services.validation_service import validate_result


def test_right_loading_side_mirrors_the_left_result(small_truck):
    cargo = CargoType(id="c1", name="Box", length=50, width=50, height=50, weight=10, quantity=3)

    left_result = run_packing([cargo], small_truck, loading_side="left")
    right_result = run_packing([cargo], small_truck, loading_side="right")

    left_items = sorted(left_result.trucks[0].items, key=lambda i: i.instance.instance_id)
    right_items = sorted(right_result.trucks[0].items, key=lambda i: i.instance.instance_id)

    for left_item, right_item in zip(left_items, right_items, strict=True):
        assert left_item.x == right_item.x
        assert left_item.z == right_item.z
        assert right_item.y == small_truck.width - left_item.y - left_item.width


def test_right_loading_side_hugs_the_far_wall(small_truck):
    cargo = CargoType(id="c1", name="Box", length=50, width=50, height=50, weight=10, quantity=1)
    result = run_packing([cargo], small_truck, loading_side="right")
    item = result.trucks[0].items[0]
    assert item.y + item.width == small_truck.width


def test_right_loading_side_result_is_still_valid(small_truck):
    cargo = CargoType(id="c1", name="Box", length=40, width=30, height=30, weight=5, quantity=10)
    result = run_packing([cargo], small_truck, loading_side="right")
    assert validate_result(result.trucks, small_truck) == []
