from backend.main import analyze_threat, ThreatRequest

def test():
    cases = [
        ("example.com", "domain"),
        ("SELECT * FROM users WHERE username = 'admin' OR '1'='1'", "payload"),
        ("<script>alert('XSS')</script>", "payload")
    ]
    for target, target_type in cases:
        req = ThreatRequest(target=target, target_type=target_type)
        res = analyze_threat(req)
        print(f"=== TARGET: {target} ({target_type}) ===")
        print("Risk Level:", res.risk_level)
        print("Status:", res.status)
        print("Confidence:", res.confidence)
        print("Message:", res.message)
        print("Detected Indicators:", res.detected_indicators)
        print()

if __name__ == "__main__":
    test()
