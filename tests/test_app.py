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
    unique_email = f"test_{uuid.uuid4().hex}@example.com"
    activity = "Drama Club"

    # Signup - must succeed the first time with a fresh email
    response = client.post(f"/activities/{activity}/signup?email={unique_email}")
    assert response.status_code == 200

    # Verify participant is present after signup
    activities = client.get("/activities").json()
    assert unique_email in activities[activity]["participants"]

    # Unregister - must succeed now that the student is registered
    response = client.post(f"/activities/{activity}/unregister?email={unique_email}")
    assert response.status_code == 200

    # Verify participant is absent after unregister
    activities = client.get("/activities").json()
    assert unique_email not in activities[activity]["participants"]
