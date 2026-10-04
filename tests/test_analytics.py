import unittest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import get_analytics, get_history, save_scan

class TestAnalyticsAPI(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health_check(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "healthy")

    def test_history_endpoint(self):
        response = self.client.get("/api/history")
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)

    def test_analytics_endpoint(self):
        response = self.client.get("/api/analytics")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        required_keys = [
            "total_scans", "critical_count", "high_count", "medium_count",
            "low_count", "active_count", "resolved_count", "average_confidence",
            "recent_scan_count", "severity_distribution", "scan_trend"
        ]
        for key in required_keys:
            self.assertIn(key, data, f"Missing key '{key}' in analytics response")
        
        self.assertIsInstance(data["severity_distribution"], dict)
        self.assertIsInstance(data["scan_trend"], list)

    def test_scan_updates_analytics(self):
        # 1. Fetch initial analytics count
        initial_analytics = self.client.get("/api/analytics").json()
        initial_total = initial_analytics["total_scans"]
        initial_high = initial_analytics["high_count"]

        # 2. Perform a new threat scan (High risk payload)
        payload = {"target": "DROP TABLE users; -- malware exploit", "target_type": "payload"}
        scan_response = self.client.post("/api/analyze", json=payload)
        self.assertEqual(scan_response.status_code, 200)

        # 3. Fetch updated analytics
        updated_analytics = self.client.get("/api/analytics").json()
        self.assertEqual(updated_analytics["total_scans"], initial_total + 1)
        self.assertEqual(updated_analytics["high_count"], initial_high + 1)
        print("\n[SUCCESS] End-to-end verification: Scan -> SQLite -> /api/analytics numbers updated dynamically!")
        print(f"Total Scans before: {initial_total} -> after: {updated_analytics['total_scans']}")
        print(f"High Scans before: {initial_high} -> after: {updated_analytics['high_count']}")

if __name__ == "__main__":
    unittest.main()
