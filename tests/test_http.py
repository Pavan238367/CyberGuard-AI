from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_analyze_threat_http():
    payload = {
        "target": "SELECT * FROM users WHERE username = 'admin' OR '1'='1'",
        "target_type": "payload"
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["target"] == payload["target"]
    assert data["target_type"] == payload["target_type"]
    assert "risk_level" in data
    assert "confidence" in data
    assert "status" in data
    assert "message" in data
    assert "detected_indicators" in data


def test_analyze_clean_target_http():
    payload = {
        "target": "example.com",
        "target_type": "domain"
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["target"] == payload["target"]
    assert data["target_type"] == payload["target_type"]
    assert data["risk_level"] == "LOW"
    assert data["status"] == "clean"
    assert "confidence" in data


if __name__ == "__main__":
    test_analyze_threat_http()
    test_analyze_clean_target_http()
    print("HTTP API tests completed successfully.")

