import pytest

from app.schemas.transport import Transport


@pytest.fixture
def small_truck() -> Transport:
    return Transport(id="t1", name="Test Truck", length=200, width=200, height=200, max_weight=10000)


@pytest.fixture
def euro_truck() -> Transport:
    return Transport(id="euro-truck-86", name="Еврофура 86 м³", length=1360, width=245, height=265, max_weight=22000)
