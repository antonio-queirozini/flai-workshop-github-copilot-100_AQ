import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    assert isinstance(response.json(), dict)

def test_signup_and_unregister():
    # Signup
    response = client.post("/activities/Drama%20Club/signup?email=test@example.com")
    assert response.status_code in (200, 400)  # 400 if already signed up
    # Unregister
    response = client.post("/activities/Drama%20Club/unregister?email=test@example.com")
    assert response.status_code in (200, 400)  # 400 if not registered
