from pydantic import Field

from app.schemas.common import CamelModel


class Transport(CamelModel):
    """A truck / container definition. All dimensions in cm, weight in kg."""

    id: str
    name: str
    length: float = Field(gt=0)
    width: float = Field(gt=0)
    height: float = Field(gt=0)
    max_weight: float = Field(gt=0)

    @property
    def volume_m3(self) -> float:
        return (self.length * self.width * self.height) / 1_000_000

    @property
    def floor_area_m2(self) -> float:
        return (self.length * self.width) / 10_000


TRANSPORT_PRESETS: list[Transport] = [
    Transport(
        id="euro-truck-86",
        name="Еврофура 86 м³",
        length=1360,
        width=245,
        height=265,
        max_weight=22000,
    ),
    Transport(
        id="euro-truck-mega-100",
        name="Еврофура MEGA 100 м³",
        length=1360,
        width=245,
        height=300,
        max_weight=22000,
    ),
    Transport(
        id="euro-truck-36",
        name="Еврофура 36 м³",
        length=700,
        width=220,
        height=240,
        max_weight=10000,
    ),
    Transport(
        id="container-20",
        name="Контейнер 20'",
        length=589,
        width=235,
        height=239,
        max_weight=24800,
    ),
    Transport(
        id="container-40",
        name="Контейнер 40'",
        length=1203,
        width=235,
        height=239,
        max_weight=28470,
    ),
    Transport(
        id="container-40-hc",
        name="Контейнер 40' HC",
        length=1203,
        width=235,
        height=270,
        max_weight=28490,
    ),
]
