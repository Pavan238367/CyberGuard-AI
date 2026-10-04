import re
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:
    from backend.database import init_db, save_scan, get_history, get_analytics
except ImportError:
    from database import init_db, save_scan, get_history, get_analytics

app = FastAPI(
    title="CyberGuard AI API",
    description="Backend API service for CyberGuard AI threat detection and security monitoring."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    """Initialize SQLite database tables on application launch."""
    init_db()


class ThreatRequest(BaseModel):
    target: str
    target_type: str


class ThreatResponse(BaseModel):
    id: Optional[int] = None
    timestamp: Optional[str] = None
    target: str
    target_type: str
    risk_level: str
    confidence: float
    status: str
    message: str
    detected_indicators: List[str]


class AnalyticsResponse(BaseModel):
    total_scans: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    active_count: int
    resolved_count: int
    average_confidence: float
    recent_scan_count: int
    severity_distribution: dict
    scan_trend: List[dict]
    threat_risk_score: Optional[float] = 0.0
    blocked_threats: Optional[int] = 0
    active_models_count: Optional[int] = 4
    mitigation_rate: Optional[float] = 0.0
    target_type_distribution: Optional[dict] = {}


# Pattern rules for threat detection
SQLI_PATTERNS = [
    (r"union\s+select", "SQL Injection: UNION SELECT pattern"),
    (r"select\s+.*?\s+from", "SQL Injection: SELECT ... FROM query pattern"),
    (r"or\s+['\"]?\d+['\"]?\s*=\s*['\"]?\d+", "SQL Injection: Tautology condition (OR '1'='1')"),
    (r"or\s+['\"]?\w+['\"]?\s*=\s*['\"]?\w+", "SQL Injection: String tautology condition"),
    (r"drop\s+table", "SQL Injection: DROP TABLE command"),
    (r"insert\s+into", "SQL Injection: INSERT INTO command"),
    (r"delete\s+from", "SQL Injection: DELETE FROM command"),
    (r"--", "SQL Injection: Comment syntax (--)"),
    (r"/\*|\*/", "SQL Injection: Block comment syntax"),
]

XSS_PATTERNS = [
    (r"<script.*?>", "Cross-Site Scripting (XSS): <script> tag"),
    (r"javascript:", "Cross-Site Scripting (XSS): javascript: pseudo-protocol"),
    (r"onerror\s*=", "Cross-Site Scripting (XSS): onerror event handler"),
    (r"onload\s*=", "Cross-Site Scripting (XSS): onload event handler"),
    (r"document\.cookie", "Cross-Site Scripting (XSS): Cookie extraction attempt"),
    (r"alert\s*\(", "Cross-Site Scripting (XSS): alert() execution"),
]

HIGH_KEYWORDS = [
    ("malware", "Malicious software keyword indicator"),
    ("phishing", "Phishing domain/URL keyword indicator"),
    ("virus", "Virus/Trojan keyword indicator"),
    ("exploit", "Exploit payload keyword indicator"),
    ("trojan", "Trojan malware keyword indicator"),
    ("ransomware", "Ransomware keyword indicator"),
]

MEDIUM_KEYWORDS = [
    ("hack", "Hacking attempt keyword"),
    ("attack", "Attack vector keyword"),
    ("credential", "Credential harvesting indicator"),
    ("bypass", "Authentication bypass indicator"),
]


@app.get("/")
def read_root():
    return {
        "message": "CyberGuard AI API is running",
        "status": "healthy"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CyberGuard AI Backend"
    }


@app.post("/api/analyze", response_model=ThreatResponse)
def analyze_threat(request: ThreatRequest):
    target_clean = request.target.strip()
    target_type_clean = request.target_type.strip()

    if not target_clean:
        raise HTTPException(status_code=400, detail="Target cannot be empty.")

    target_lower = target_clean.lower()
    detected_indicators = []
    high_threat_found = False
    medium_threat_found = False

    # Check SQL Injection patterns
    for pattern, desc in SQLI_PATTERNS:
        if re.search(pattern, target_lower, re.IGNORECASE):
            detected_indicators.append(desc)
            high_threat_found = True

    # Check XSS patterns
    for pattern, desc in XSS_PATTERNS:
        if re.search(pattern, target_lower, re.IGNORECASE):
            detected_indicators.append(desc)
            high_threat_found = True

    # Check High Threat Keywords
    for kw, desc in HIGH_KEYWORDS:
        if kw in target_lower:
            detected_indicators.append(desc)
            high_threat_found = True

    # Check Medium Threat Keywords
    for kw, desc in MEDIUM_KEYWORDS:
        if kw in target_lower:
            detected_indicators.append(desc)
            medium_threat_found = True

    # Deduplicate indicators preserving order
    unique_indicators = list(dict.fromkeys(detected_indicators))

    if high_threat_found:
        risk_level = "HIGH"
        confidence = 0.95 if len(unique_indicators) > 1 else 0.88
        status = "suspicious"
        message = f"Critical threat indicators detected: {'; '.join(unique_indicators)}"
    elif medium_threat_found:
        risk_level = "MEDIUM"
        confidence = 0.75
        status = "suspicious"
        message = f"Suspicious activity indicators detected: {'; '.join(unique_indicators)}"
    else:
        risk_level = "LOW"
        confidence = 0.95
        status = "clean"
        message = "No suspicious indicators detected."

    # Persist scan analysis result into SQLite database
    saved_scan = save_scan(
        target=target_clean,
        target_type=target_type_clean,
        risk_level=risk_level,
        confidence=confidence,
        status=status,
        message=message,
        detected_indicators=unique_indicators
    )

    return ThreatResponse(**saved_scan)


@app.get("/api/history", response_model=List[ThreatResponse])
def get_scan_history(limit: int = 50):
    """Retrieve scan history list from database."""
    return get_history(limit=limit)


@app.get("/api/analytics", response_model=AnalyticsResponse)
def get_analytics_endpoint():
    """Retrieve aggregated analytics statistics derived from SQLite database."""
    try:
        return get_analytics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch analytics: {str(e)}")
