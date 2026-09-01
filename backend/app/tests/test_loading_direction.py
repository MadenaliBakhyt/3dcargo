"""The loading-direction setting mirrors placements along the truck's length
without changing anything about validity (collisions, bounds, support)."""

from app.algorithms.bin_packing import run_packing
from app.schemas.cargo import CargoType
from app.services.validation_service import validate_result


def test_back_loading_direction_mirrors_the_front_result(small_truck):
    cargo = CargoType(id="c1", name="Box", length=50, width=50, height=50, weight=10, quantity=3)

    front_result = run_packing([cargo], small_truck, loading_direction="front")
    back_result = run_packing([cargo], small_truck, loading_direction="back")

    front_items = sorted(front_result.trucks[0].items, key=lambda i: i.instance.instance_id)
    back_items = sorted(back_result.trucks[0].items, key=lambda i: i.instance.instance_id)

    for front_item, back_item in zip(front_items, back_items, strict=True):
        assert front_item.y == back_item.y
        assert front_item.z == back_item.z
        assert back_item.x == small_truck.length - front_item.x - front_item.length


def test_back_loading_direction_hugs_the_rear_doors(small_truck):
    cargo = CargoType(id="c1", name="Box", length=50, width=50, height=50, weight=10, quantity=1)
    result = run_packing([cargo], small_truck, loading_direction="back")
    item = result.trucks[0].items[0]
    assert item.x + item.length == small_truck.length


def test_back_loading_direction_result_is_still_valid(small_truck):
    cargo = CargoType(id="c1", name="Box", length=40, width=30, height=30, weight=5, quantity=10)
    result = run_packing([cargo], small_truck, loading_direction="back")
    assert validate_result(result.trucks, small_truck) == []


def test_loading_side_and_direction_combine_independently(small_truck):
    cargo = CargoType(id="c1", name="Box", length=40, width=30, height=30, weight=5, quantity=1)

    front_left = run_packing([cargo], small_truck, loading_side="left", loading_direction="front").trucks[0].items[0]
    back_right = run_packing([cargo], small_truck, loading_side="right", loading_direction="back").trucks[0].items[0]

    assert back_right.x == small_truck.length - front_left.x - front_left.length
    assert back_right.y == small_truck.width - front_left.y - front_left.width
    assert back_right.z == front_left.z
