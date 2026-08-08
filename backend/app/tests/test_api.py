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
