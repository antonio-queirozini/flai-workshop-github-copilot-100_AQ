import uuid
import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    assert isinstance(response.json(), dict)

def test_signup_and_unregister():
    unique_email = f"test-{uuid.uuid4()}@example.com"

    # Signup should succeed for a new unique email
    response = client.post(f"/activities/Drama%20Club/signup?email={unique_email}")
    assert response.status_code == 200

    # Verify participant is present after signup
    activities = client.get("/activities").json()
    assert unique_email in activities["Drama Club"]["participants"]

    # Unregister should succeed since participant is signed up
    response = client.post(f"/activities/Drama%20Club/unregister?email={unique_email}")
    assert response.status_code == 200

    # Verify participant is absent after unregister
    activities = client.get("/activities").json()
    assert unique_email not in activities["Drama Club"]["participants"]
