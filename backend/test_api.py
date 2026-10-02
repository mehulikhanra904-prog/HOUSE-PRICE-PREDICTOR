from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_locations():
    response = client.get("/locations")
    assert response.status_code == 200
    assert response.json()["count"] > 0


def test_prediction_keeps_existing_contract():
    response = client.post(
        "/predict",
        params={
            "area_sqft": 1500,
            "bedrooms": 3,
            "bathrooms": 2,
            "age": 5,
            "location": "Kolkata"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "predicted_price" in data
    assert "location" in data
    assert "estimated_price_per_sqft" in data


def test_batch_prediction():
    response = client.post(
        "/predict/batch",
        json=[
            {
                "area_sqft": 1200,
                "bedrooms": 3,
                "bathrooms": 2,
                "age": 5,
                "location": "Kolkata"
            },
            {
                "area_sqft": 900,
                "bedrooms": 2,
                "bathrooms": 2,
                "age": 10,
                "location": "Mumbai"
            }
        ]
    )
    assert response.status_code == 200
    assert response.json()["count"] == 2


def test_invalid_prediction_is_rejected():
    response = client.post(
        "/predict",
        params={
            "area_sqft": -10,
            "bedrooms": 3,
            "bathrooms": 2,
            "age": 5,
            "location": "Kolkata"
        }
    )
    assert response.status_code == 422
