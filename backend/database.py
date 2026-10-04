import sqlite3
import json
import os
from datetime import datetime, timedelta, UTC

# SQLite database file path stored inside backend folder
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cyberguard.db")


def get_db_connection():
    """Establish and return a connection to the SQLite database."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize SQLite database tables if they do not already exist."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS scan_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            target TEXT NOT NULL,
            target_type TEXT NOT NULL,
            risk_level TEXT NOT NULL,
            confidence REAL NOT NULL,
            status TEXT NOT NULL,
            message TEXT NOT NULL,
            detected_indicators TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


def save_scan(target: str, target_type: str, risk_level: str, confidence: float, status: str, message: str, detected_indicators: list) -> dict:
    """Save a scan analysis result into SQLite database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    timestamp = datetime.now(UTC).isoformat()
    indicators_json = json.dumps(detected_indicators)

    cursor.execute("""
        INSERT INTO scan_history (timestamp, target, target_type, risk_level, confidence, status, message, detected_indicators)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (timestamp, target, target_type, risk_level, confidence, status, message, indicators_json))
    
    scan_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {
        "id": scan_id,
        "timestamp": timestamp,
        "target": target,
        "target_type": target_type,
        "risk_level": risk_level,
        "confidence": confidence,
        "status": status,
        "message": message,
        "detected_indicators": detected_indicators
    }


def get_history(limit: int = 50) -> list:
    """Retrieve recent scan history records from SQLite database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, timestamp, target, target_type, risk_level, confidence, status, message, detected_indicators
        FROM scan_history
        ORDER BY id DESC
        LIMIT ?
    """, (limit,))
    
    rows = cursor.fetchall()
    conn.close()

    history = []
    for row in rows:
        item = dict(row)
        try:
            item["detected_indicators"] = json.loads(item["detected_indicators"])
        except Exception:
            item["detected_indicators"] = []
        history.append(item)

    return history


def get_analytics() -> dict:
    """Calculate and return aggregated analytics statistics derived from SQLite database."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM scan_history")
    total_scans = cursor.fetchone()[0] or 0

    if total_scans == 0:
        conn.close()
        return {
            "total_scans": 0,
            "critical_count": 0,
            "high_count": 0,
            "medium_count": 0,
            "low_count": 0,
            "active_count": 0,
            "resolved_count": 0,
            "average_confidence": 0.0,
            "recent_scan_count": 0,
            "severity_distribution": {
                "CRITICAL": 0,
                "HIGH": 0,
                "MEDIUM": 0,
                "LOW": 0
            },
            "scan_trend": [],
            "threat_risk_score": 0.0,
            "blocked_threats": 0,
            "active_models_count": 4,
            "mitigation_rate": 0.0,
            "target_type_distribution": {
                "payload": 0,
                "ip": 0,
                "domain": 0,
                "url": 0,
                "hash": 0
            }
        }

    # Counts grouped by risk level (CRITICAL, HIGH, MEDIUM, LOW)
    cursor.execute("""
        SELECT UPPER(risk_level) as risk, COUNT(*) as count 
        FROM scan_history 
        GROUP BY UPPER(risk_level)
    """)
    risk_rows = cursor.fetchall()
    risk_counts = {row["risk"]: row["count"] for row in risk_rows}

    critical_count = risk_counts.get("CRITICAL", 0)
    high_count = risk_counts.get("HIGH", 0)
    medium_count = risk_counts.get("MEDIUM", 0)
    low_count = risk_counts.get("LOW", 0)

    # Active vs Resolved status counts
    cursor.execute("""
        SELECT LOWER(status) as st, COUNT(*) as count 
        FROM scan_history 
        GROUP BY LOWER(status)
    """)
    status_rows = cursor.fetchall()
    status_counts = {row["st"]: row["count"] for row in status_rows}

    active_count = status_counts.get("suspicious", 0) + status_counts.get("active", 0)
    resolved_count = status_counts.get("clean", 0) + status_counts.get("resolved", 0) + status_counts.get("quarantined", 0)

    # Average confidence
    cursor.execute("SELECT AVG(confidence) FROM scan_history")
    avg_conf_row = cursor.fetchone()[0]
    average_confidence = round(float(avg_conf_row), 4) if avg_conf_row is not None else 0.0

    # Recent scans (scans created in the last 24 hours)
    cutoff = (datetime.now(UTC) - timedelta(days=1)).isoformat()
    cursor.execute("SELECT COUNT(*) FROM scan_history WHERE timestamp >= ?", (cutoff,))
    recent_scan_count = cursor.fetchone()[0] or 0

    # Scan trend grouped by date (YYYY-MM-DD)
    cursor.execute("""
        SELECT substr(timestamp, 1, 10) as scan_date, COUNT(*) as count 
        FROM scan_history 
        GROUP BY scan_date 
        ORDER BY scan_date ASC
    """)
    trend_rows = cursor.fetchall()
    scan_trend = [{"date": row["scan_date"], "count": row["count"]} for row in trend_rows if row["scan_date"]]

    # Counts grouped by target type (payload, ip, domain, url, hash)
    cursor.execute("""
        SELECT LOWER(target_type) as t_type, COUNT(*) as count 
        FROM scan_history 
        GROUP BY LOWER(target_type)
    """)
    target_rows = cursor.fetchall()
    target_type_distribution = {
        "payload": 0,
        "ip": 0,
        "domain": 0,
        "url": 0,
        "hash": 0
    }
    for row in target_rows:
        if row["t_type"]:
            target_type_distribution[row["t_type"]] = row["count"]

    conn.close()

    # Threat Risk Score (0 - 100) computed from weighted severity distribution
    weighted_sum = (critical_count * 100) + (high_count * 75) + (medium_count * 50) + (low_count * 10)
    threat_risk_score = round(weighted_sum / total_scans, 1)

    # Blocked threats count (clean + resolved + quarantined)
    blocked_threats = resolved_count

    # Mitigation rate: percentage of resolved scans out of total scans, or 100% if all threats mitigated
    total_threats = critical_count + high_count + medium_count
    if total_threats == 0:
        mitigation_rate = 100.0
    else:
        mitigation_rate = round((resolved_count / (active_count + resolved_count)) * 100, 1) if (active_count + resolved_count) > 0 else 0.0

    severity_distribution = {
        "CRITICAL": critical_count,
        "HIGH": high_count,
        "MEDIUM": medium_count,
        "LOW": low_count
    }

    return {
        "total_scans": total_scans,
        "critical_count": critical_count,
        "high_count": high_count,
        "medium_count": medium_count,
        "low_count": low_count,
        "active_count": active_count,
        "resolved_count": resolved_count,
        "average_confidence": average_confidence,
        "recent_scan_count": recent_scan_count,
        "severity_distribution": severity_distribution,
        "scan_trend": scan_trend,
        "threat_risk_score": threat_risk_score,
        "blocked_threats": blocked_threats,
        "active_models_count": 4,
        "mitigation_rate": mitigation_rate,
        "target_type_distribution": target_type_distribution
    }

