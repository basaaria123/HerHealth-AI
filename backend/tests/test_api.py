from datetime import date

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client(tmp_path, monkeypatch):
    from app import database

    test_db = tmp_path / "test_herhealth.db"
    test_engine = database.create_engine(
        f"sqlite:///{test_db.as_posix()}",
        connect_args={"check_same_thread": False},
    )

    test_session = database.sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=test_engine,
    )

    database.Base.metadata.create_all(bind=test_engine)

    def override_get_db():
        db = test_session()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[database.get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    database.Base.metadata.drop_all(bind=test_engine)
    test_engine.dispose()


def sample_symptom():
    return {
        "date": date.today().isoformat(),
        "symptom_type": "menstrual_pain",
        "pain_severity": 6,
        "duration_minutes": 120,
        "mood": "irritable",
        "fatigue_level": 5,
        "notes": "Synthetic demo entry",
    }


def test_health_endpoint(client):
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_create_and_list_symptom(client):
    create_response = client.post(
        "/api/symptoms",
        json=sample_symptom(),
    )

    assert create_response.status_code == 201
    created = create_response.json()
    assert created["symptom_type"] == "menstrual_pain"
    assert created["pain_severity"] == 6
    assert created["id"] > 0

    list_response = client.get("/api/symptoms")

    assert list_response.status_code == 200
    assert len(list_response.json()) == 1
    assert list_response.json()[0]["id"] == created["id"]


def test_invalid_pain_severity_is_rejected(client):
    payload = sample_symptom()
    payload["pain_severity"] = 11

    response = client.post("/api/symptoms", json=payload)

    assert response.status_code == 422


def test_invalid_symptom_type_is_rejected(client):
    payload = sample_symptom()
    payload["symptom_type"] = "unknown_category"

    response = client.post("/api/symptoms", json=payload)

    assert response.status_code == 422


def test_insights_with_no_entries(client):
    response = client.get("/api/insights")

    assert response.status_code == 200
    assert response.json()["total_entries"] == 0
    assert "disclaimer" in response.json()


def test_delete_symptom(client):
    create_response = client.post(
        "/api/symptoms",
        json=sample_symptom(),
    )
    symptom_id = create_response.json()["id"]

    delete_response = client.delete(f"/api/symptoms/{symptom_id}")

    assert delete_response.status_code == 200
    assert delete_response.json()["id"] == symptom_id
    assert client.get("/api/symptoms").json() == []


def test_delete_missing_symptom_returns_404(client):
    response = client.delete("/api/symptoms/99999")

    assert response.status_code == 404
def test_insights_include_frequency_and_average_pain(client):
    client.post("/api/symptoms", json=sample_symptom())

    response = client.get("/api/insights")

    assert response.status_code == 200
    data = response.json()

    assert data["total_entries"] == 1
    assert data["symptom_frequency"]["menstrual_pain"] == 1
    assert data["average_pain_severity"] == 6
    assert any(
        item["type"] == "pain_summary"
        for item in data["observations"]
    )


def test_insights_detect_high_pain(client):
    payload = sample_symptom()
    payload["pain_severity"] = 9
    client.post("/api/symptoms", json=payload)

    response = client.get("/api/insights")
    data = response.json()

    assert response.status_code == 200
    assert any(
        item["type"] == "high_pain"
        for item in data["observations"]
    )


def test_insights_include_disclaimer(client):
    response = client.get("/api/insights")

    assert response.status_code == 200
    assert "not a medical diagnosis" in response.json()["disclaimer"]

def test_doctor_summary_with_no_entries(client):
    response = client.get("/api/reports/summary")

    assert response.status_code == 200
    data = response.json()

    assert data["total_entries"] == 0
    assert data["reporting_period"] is None
    assert data["history"] == []
    assert data["average_pain_severity"] is None
    assert "not a medical diagnosis" in data["disclaimer"]


def test_doctor_summary_includes_symptom_history(client):
    client.post("/api/symptoms", json=sample_symptom())

    response = client.get("/api/reports/summary")

    assert response.status_code == 200
    data = response.json()

    assert data["total_entries"] == 1
    assert data["symptom_frequency"]["menstrual_pain"] == 1
    assert data["average_pain_severity"] == 6
    assert len(data["history"]) == 1
    assert data["history"][0]["symptom_type"] == "menstrual_pain"
    assert data["history"][0]["pain_severity"] == 6


def test_doctor_summary_calculates_average_pain(client):
    first = sample_symptom()
    first["pain_severity"] = 4

    second = sample_symptom()
    second["pain_severity"] = 8

    client.post("/api/symptoms", json=first)
    client.post("/api/symptoms", json=second)

    response = client.get("/api/reports/summary")
    data = response.json()

    assert response.status_code == 200
    assert data["total_entries"] == 2
    assert data["average_pain_severity"] == 6
    assert len(data["history"]) == 2
