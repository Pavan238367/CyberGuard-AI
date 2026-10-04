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


def test_analyze_whitespace_stripping():
    payload = {
        "target": "   example.com   ",
        "target_type": " DOMAIN "
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["target"] == "example.com"
    assert data["target_type"] == "domain"


def test_analyze_empty_target_returns_422():
    payload = {"target": "", "target_type": "domain"}
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 422


def test_analyze_whitespace_target_returns_422():
    payload = {"target": "   ", "target_type": "domain"}
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 422


def test_analyze_overlong_target_returns_422():
    payload = {"target": "a" * 2049, "target_type": "domain"}
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 422


def test_analyze_invalid_target_type_returns_422():
    payload = {"target": "example.com", "target_type": "unsupported_type"}
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 422


if __name__ == "__main__":
    test_analyze_threat_http()
    test_analyze_clean_target_http()
    test_analyze_whitespace_stripping()
    test_analyze_empty_target_returns_422()
    test_analyze_whitespace_target_returns_422()
    test_analyze_overlong_target_returns_422()
    test_analyze_invalid_target_type_returns_422()
    print("HTTP API tests completed successfully.")

