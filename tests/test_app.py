import uuid
import pytest
from urllib.parse import unquote
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    assert isinstance(response.json(), dict)

def test_signup_and_unregister():
    unique_email = f"test-{uuid.uuid4()}@example.com"
    activity = "Drama%20Club"
    activity_key = unquote(activity)

    # Signup should succeed with a fresh unique email
    response = client.post(f"/activities/{activity}/signup?email={unique_email}")
    assert response.status_code == 200

    # Verify participant is present after signup
    activities = client.get("/activities").json()
    assert unique_email in activities[activity_key]["participants"]

    # Unregister should succeed
    response = client.post(f"/activities/{activity}/unregister?email={unique_email}")
    assert response.status_code == 200

    # Verify participant is absent after unregister
    activities = client.get("/activities").json()
    assert unique_email not in activities[activity_key]["participants"]
