import pytest
import uuid
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert len(data) > 0

def test_signup_adds_participant():
    email = f"test-{uuid.uuid4()}@example.com"
    activity = "Drama Club"

    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 200
    assert "signed up" in response.json()["message"].lower()

    # Verify participant is present after signup
    activities = client.get("/activities").json()
    assert email in activities[activity]["participants"]

def test_signup_duplicate_rejected():
    email = f"test-{uuid.uuid4()}@example.com"
    activity = "Drama Club"

    client.post(f"/activities/{activity}/signup?email={email}")
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 400

def test_unregister_removes_participant():
    email = f"test-{uuid.uuid4()}@example.com"
    activity = "Drama Club"

    # First sign up
    client.post(f"/activities/{activity}/signup?email={email}")

    # Then unregister
    response = client.post(f"/activities/{activity}/unregister?email={email}")
    assert response.status_code == 200

    # Verify participant is absent after unregister
    activities = client.get("/activities").json()
    assert email not in activities[activity]["participants"]

def test_unregister_nonparticipant_rejected():
    email = f"test-{uuid.uuid4()}@example.com"
    activity = "Drama Club"

    response = client.post(f"/activities/{activity}/unregister?email={email}")
    assert response.status_code == 400
