from app.algorithms.bin_packing import run_packing
from app.schemas.calculation import CalculationRequest, CalculationResponse
from app.schemas.placement import Placement, Rotation, TruckSummary, UnplacedItem
from app.services.statistics_service import build_overall_statistics, build_truck_statistics
from app.services.validation_service import validate_result


class CalculationError(ValueError):
    """Raised for semantically invalid requests (caught by the API layer and
    turned into a 400 response with a user-facing message)."""


def validate_request(request: CalculationRequest) -> None:
    if not request.cargo_types:
        raise CalculationError("Добавьте хотя бы один груз для расчёта.")
    total_quantity = sum(c.quantity for c in request.cargo_types)
    if total_quantity < 1:
        raise CalculationError("Количество должно быть больше 0.")
    if total_quantity > 20000:
        raise CalculationError("Слишком много грузовых мест для расчёта (максимум 20000).")


def calculate(request: CalculationRequest) -> CalculationResponse:
    validate_request(request)

    transport = request.transport
    result = run_packing(
        cargo_types=request.cargo_types,
        transport=transport,
        max_trucks=request.settings.max_trucks,
        support_ratio_threshold=request.settings.support_ratio_threshold,
    )

    warnings: list[str] = []
    integrity_problems = validate_result(result.trucks, transport)
    if integrity_problems:
        warnings.extend(f"Внутренняя проверка обнаружила проблему: {p}" for p in integrity_problems)

    trucks_summary = [
        TruckSummary(
            id=t.id,
            name=t.name,
            length=transport.length,
            width=transport.width,
            height=transport.height,
            max_weight=transport.max_weight,
        )
        for t in result.trucks
    ]

    placements: list[Placement] = []
    for truck in result.trucks:
        for item in truck.items:
            placements.append(
                Placement(
                    instance_id=item.instance.instance_id,
                    cargo_id=item.instance.cargo_type_id,
                    cargo_name=item.instance.name,
                    truck_id=truck.id,
                    x=round(item.x, 3),
                    y=round(item.y, 3),
                    z=round(item.z, 3),
                    length=item.length,
                    width=item.width,
                    height=item.height,
                    rotation=Rotation(**item.rotation),
                    orientation_code=item.orientation_code,
                    weight=item.instance.weight,
                    color=item.instance.color,
                    package_type=item.instance.package_type,
                    fragile=item.instance.fragile,
                    priority=item.instance.priority,
                    layer=item.tier,
                    loading_order=item.loading_order,
                    supported_by=item.supported_by,
                )
            )

    truck_statistics = [build_truck_statistics(t, transport) for t in result.trucks]
    for stats in truck_statistics:
        if stats.center_of_gravity.offset_warning:
            warnings.append(
                f"{stats.truck_id}: центр тяжести значительно смещён от центра — проверьте распределение груза."
            )

    total_cargo_items = sum(c.quantity for c in request.cargo_types)
    unplaced_count = len(result.unplaced)
    overall_statistics = build_overall_statistics(
        result.trucks, total_cargo_items, unplaced_count, transport
    )

    unplaced_out = [
        UnplacedItem(
            instance_id=u.instance.instance_id,
            cargo_type_id=u.instance.cargo_type_id,
            name=u.instance.name,
            reason=u.reason,
        )
        for u in result.unplaced
    ]

    if unplaced_out:
        warnings.append(f"Не удалось разместить {len(unplaced_out)} из {total_cargo_items} грузовых мест.")

    return CalculationResponse(
        success=len(unplaced_out) == 0,
        trucks=trucks_summary,
        placements=placements,
        statistics=overall_statistics,
        truck_statistics=truck_statistics,
        unplaced=unplaced_out,
        warnings=warnings,
    )
