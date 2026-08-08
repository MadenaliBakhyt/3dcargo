from app.algorithms.bin_packing import Truck
from app.algorithms.center_of_gravity import compute_center_of_gravity
from app.schemas.placement import CenterOfGravity, OverallStatistics, TruckStatistics
from app.schemas.transport import Transport


def build_truck_statistics(truck: Truck, transport: Transport) -> TruckStatistics:
    truck_volume_m3 = (transport.length * transport.width * transport.height) / 1_000_000
    used_volume_m3 = sum(i.volume for i in truck.items) / 1_000_000
    total_weight = sum(i.instance.weight for i in truck.items)
    floor_area = transport.length * transport.width
    used_floor_area = sum(i.length * i.width for i in truck.items if i.z <= 1e-6)

    cx, cy, cz, offset_warning = compute_center_of_gravity(
        truck.items, transport.length, transport.width, transport.height
    )

    return TruckStatistics(
        truck_id=truck.id,
        placed_count=len(truck.items),
        total_weight=total_weight,
        total_volume_m3=used_volume_m3,
        volume_utilization=round((used_volume_m3 / truck_volume_m3 * 100) if truck_volume_m3 else 0, 1),
        weight_utilization=round((total_weight / transport.max_weight * 100) if transport.max_weight else 0, 1),
        floor_utilization=round((used_floor_area / floor_area * 100) if floor_area else 0, 1),
        free_volume_m3=round(truck_volume_m3 - used_volume_m3, 3),
        center_of_gravity=CenterOfGravity(
            x=round(cx, 1), y=round(cy, 1), z=round(cz, 1), offset_warning=offset_warning
        ),
    )


def build_overall_statistics(
    trucks: list[Truck], total_cargo_items: int, unplaced_count: int, transport: Transport
) -> OverallStatistics:
    truck_volume_m3 = (transport.length * transport.width * transport.height) / 1_000_000
    total_capacity_volume = truck_volume_m3 * len(trucks)
    total_capacity_weight = transport.max_weight * len(trucks)

    used_volume_m3 = sum(sum(i.volume for i in t.items) for t in trucks) / 1_000_000
    total_weight = sum(sum(i.instance.weight for i in t.items) for t in trucks)
    placed_items = sum(len(t.items) for t in trucks)

    return OverallStatistics(
        truck_count=len(trucks),
        total_cargo_items=total_cargo_items,
        placed_items=placed_items,
        unplaced_items=unplaced_count,
        total_weight=total_weight,
        total_volume_m3=round(used_volume_m3, 3),
        volume_utilization=round((used_volume_m3 / total_capacity_volume * 100) if total_capacity_volume else 0, 1),
        weight_utilization=round((total_weight / total_capacity_weight * 100) if total_capacity_weight else 0, 1),
    )
