"""TEST 14: center of gravity calculation."""

from app.algorithms.center_of_gravity import compute_center_of_gravity
from app.algorithms.models import Instance, PlacedItem


def make_placed(instance_id, x, y, z, length, width, height, weight):
    instance = Instance(
        instance_id=instance_id,
        cargo_type_id="c",
        name="Box",
        length=length,
        width=width,
        height=height,
        weight=weight,
        color="#fff",
        package_type="box",
        priority="medium",
        allow_rotation=True,
        allow_vertical_rotation=False,
        stackable=True,
        max_stack_height=None,
        max_stack_tiers=None,
        fragile=False,
        max_top_load=None,
    )
    return PlacedItem(
        instance=instance,
        truck_id="t1",
        x=x,
        y=y,
        z=z,
        length=length,
        width=width,
        height=height,
        rotation={"x": 0, "y": 0, "z": 0},
        orientation_code="LWH",
        tier=1,
        loading_order=1,
        supported_by=["floor"],
    )


def test_center_of_gravity_single_item_is_its_own_center():
    item = make_placed("a", 0, 0, 0, 10, 10, 10, 100)
    cx, cy, cz, warn = compute_center_of_gravity([item], 100, 100, 100)
    assert (cx, cy, cz) == (5, 5, 5)


def test_center_of_gravity_weighted_average():
    a = make_placed("a", 0, 0, 0, 10, 10, 10, 100)  # center (5,5,5), weight 100
    b = make_placed("b", 90, 0, 0, 10, 10, 10, 300)  # center (95,5,5), weight 300
    cx, cy, cz, warn = compute_center_of_gravity([a, b], 200, 100, 100)

    expected_x = (100 * 5 + 300 * 95) / 400
    assert abs(cx - expected_x) < 1e-9
    assert abs(cy - 5) < 1e-9


def test_center_of_gravity_offset_warning_triggers_when_far_from_center():
    a = make_placed("a", 0, 0, 0, 10, 10, 10, 1000)
    cx, cy, cz, warn = compute_center_of_gravity([a], 1000, 1000, 100)
    assert warn is True


def test_center_of_gravity_no_warning_when_centered():
    a = make_placed("a", 45, 45, 0, 10, 10, 10, 1000)
    cx, cy, cz, warn = compute_center_of_gravity([a], 100, 100, 100)
    assert warn is False


def test_center_of_gravity_empty_list():
    cx, cy, cz, warn = compute_center_of_gravity([], 100, 100, 100)
    assert (cx, cy, cz, warn) == (0.0, 0.0, 0.0, False)
