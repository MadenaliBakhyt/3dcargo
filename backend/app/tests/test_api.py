from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_calculate_endpoint_euro_truck_demo_scenario():
    payload = {
        "transport": {
            "id": "euro-truck-86",
            "name": "Еврофура 86 м³",
            "length": 1360,
            "width": 245,
            "height": 265,
            "maxWeight": 22000,
        },
        "cargoTypes": [
            {
                "id": "pallet-a",
                "name": "Паллета A",
                "length": 120,
                "width": 80,
                "height": 160,
                "weight": 450,
                "quantity": 15,
            }
        ],
    }
    response = client.post("/api/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["success"] is True
    assert len(data["trucks"]) == 1
    assert len(data["placements"]) == 15
    assert data["statistics"]["placedItems"] == 15
    assert data["statistics"]["unplacedItems"] == 0
    assert data["unplaced"] == []


def test_calculate_endpoint_respects_loading_side_setting():
    payload = {
        "transport": {"id": "t", "name": "T", "length": 200, "width": 200, "height": 200, "maxWeight": 5000},
        "cargoTypes": [
            {"id": "c1", "name": "Box", "length": 50, "width": 50, "height": 50, "weight": 10, "quantity": 1}
        ],
        "settings": {"loadingSide": "right"},
    }
    response = client.post("/api/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    placement = data["placements"][0]
    assert placement["y"] + placement["width"] == 200


def test_calculate_endpoint_respects_prefer_stacking_setting():
    payload = {
        "transport": {"id": "t", "name": "T", "length": 1000, "width": 1000, "height": 300, "maxWeight": 50000},
        "cargoTypes": [
            {
                "id": "c1", "name": "Box", "length": 50, "width": 50, "height": 50,
                "weight": 10, "quantity": 6, "stackable": True,
            }
        ],
        "settings": {"preferStacking": True},
    }
    response = client.post("/api/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    zs = sorted(p["z"] for p in data["placements"])
    assert zs == [0, 50, 100, 150, 200, 250]


def test_calculate_endpoint_rejects_empty_cargo_list():
    payload = {
        "transport": {
            "id": "t",
            "name": "T",
            "length": 100,
            "width": 100,
            "height": 100,
            "maxWeight": 1000,
        },
        "cargoTypes": [],
    }
    response = client.post("/api/calculate", json=payload)
    assert response.status_code == 400


def test_calculate_endpoint_rejects_invalid_dimensions():
    payload = {
        "transport": {
            "id": "t",
            "name": "T",
            "length": -10,
            "width": 100,
            "height": 100,
            "maxWeight": 1000,
        },
        "cargoTypes": [],
    }
    response = client.post("/api/calculate", json=payload)
    assert response.status_code == 422
