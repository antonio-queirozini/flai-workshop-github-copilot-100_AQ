import uuid
import pytest
from urllib.parse import quote
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert len(data) > 0

def test_signup_and_unregister():
    email = f"test_{uuid.uuid4().hex}@example.com"
    activity = "Drama Club"
    encoded_activity = quote(activity)
    encoded_email = quote(email)

    # Signup should succeed with a unique email
    response = client.post(f"/activities/{encoded_activity}/signup?email={encoded_email}")
    assert response.status_code == 200

    # Participant should now be present
    activities = client.get("/activities").json()
    assert email in activities[activity]["participants"]

    # Signing up again with the same email should fail
    response = client.post(f"/activities/{encoded_activity}/signup?email={encoded_email}")
    assert response.status_code == 400

    # Unregister should succeed
    response = client.post(f"/activities/{encoded_activity}/unregister?email={encoded_email}")
    assert response.status_code == 200

    # Participant should now be absent
    activities = client.get("/activities").json()
    assert email not in activities[activity]["participants"]

    # Unregistering again should fail
    response = client.post(f"/activities/{encoded_activity}/unregister?email={encoded_email}")
    assert response.status_code == 400
