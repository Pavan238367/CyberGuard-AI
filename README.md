# CyberGuard AI

CyberGuard AI is a full-stack cybersecurity threat intelligence and target analysis dashboard. Built with a **FastAPI** backend and a **React** (**Vite**) frontend, CyberGuard AI provides rule-based threat pattern inspection, persistent scan history via **SQLite**, aggregate security analytics, and automated API input validation.

---

## Key Implemented Features

- **Interactive React Frontend Dashboard**: Modern web interface featuring dedicated views for Dashboard overview, Threat Scanner, Threat Logs, Aggregated Analytics, and System Settings.
- **FastAPI RESTful Backend**: High-performance Python backend serving threat analysis handlers, SQLite database persistence, and aggregate telemetry endpoints.
- **Rule-Based Threat Detection Engine**: Regex and keyword pattern-matching engine detecting SQL Injection (SQLi) patterns, Cross-Site Scripting (XSS) script injections, and high/medium risk threat keywords.
- **Multi-Target Category Analysis**: Supports inspection across target categories: `payload`, `ip`, `domain`, `url`, and `hash`.
- **Risk Assessment & Confidence Scoring**: Classifies scan targets into risk levels (`HIGH`, `MEDIUM`, `LOW`) accompanied by an assessed confidence score.
- **Persistent SQLite Scan History**: Automatically records completed scan results into a local SQLite database (`cyberguard.db`), tracking timestamps, target inputs, risk levels, statuses, and detected indicators.
- **Filterable Threat Logs**: Historical log table in the frontend interface displaying scan records with status tracking (`Active`, `Resolved`, `Quarantined`).
- **Backend Analytics**: Calculates aggregate scan statistics including total scans, severity distribution, target-type counts, average confidence, and recent scan activity derived from SQLite records.
- **API Input Validation**: Pydantic schema validation enforcing target type constraints, non-empty string checks, target string normalization, and maximum target length limits (up to 2048 characters).
- **Automated HTTP & API Test Suite**: Automated Pytest test suite verifying API endpoint routing, input validation errors, database persistence, pattern detection logic, and dynamic analytics updates.

---

## Technology Stack

- **Frontend**: React 19, Vite 8, Lucide React, CSS3
- **Backend**: Python 3.13, FastAPI, Pydantic, Uvicorn
- **Database**: SQLite 3 (`cyberguard.db`)
- **Testing**: Pytest, FastAPI TestClient

---

## Project Structure

```
CyberGuard-AI/
|-- backend/
|   |-- main.py            # FastAPI application routes, validation schemas & pattern detection engine
|   |-- database.py        # SQLite schema initialization, persistence & aggregate analytics
|   +-- cyberguard.db      # Local SQLite database file (excluded from Git)
|-- frontend/
|   |-- src/
|   |   |-- components/    # React views (Dashboard, Scanner, Threat Logs, Analytics, Settings, Navbar)
|   |   |-- App.jsx        # Main application component & tab state management
|   |   |-- api.js         # Frontend HTTP client service
|   |   |-- main.jsx       # React application entry point
|   |   +-- index.css      # Global CSS theme & styling system
|   |-- package.json       # Dependencies & npm scripts
|   +-- vite.config.js     # Vite configuration
|-- tests/
|   |-- test_analytics.py  # Pytest suite for database analytics logic & dynamic updates
|   |-- test_detection.py  # Pytest suite for pattern-based threat detection rules
|   +-- test_http.py       # Pytest suite for FastAPI endpoints & input validation
|-- docs/                  # Documentation workspace
|-- ml/                    # Machine learning workspace (reserved for future ML model training)
|-- .gitignore             # Git ignore rules (excludes database, venv, node_modules)
+-- README.md              # Project documentation
```

---

## Backend API Endpoints

The FastAPI backend exposes the following RESTful API endpoints:

| HTTP Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Root endpoint returning backend service operational status message. |
| `GET` | `/api/health` | Health check endpoint returning backend status (`healthy`) and service identifier. |
| `POST` | `/api/analyze` | Accepts a target string and `target_type`, runs rule-based pattern analysis, persists results to SQLite, and returns risk analysis findings. |
| `GET` | `/api/history` | Retrieves recent scan history records from SQLite (supports optional `limit` parameter, default 50). |
| `GET` | `/api/analytics` | Returns aggregate scan statistics including total scans, severity distribution, target-type counts, average confidence, and recent scan activity. |

---

## Local Setup & Execution Guide

### Prerequisites

- **Python**: 3.10+ (Python 3.13 recommended)
- **Node.js**: 18+ and `npm`

---

### 1. Running the Backend Locally

#### Windows (PowerShell)

1. Open PowerShell and navigate to the project root directory:
   ```powershell
   cd CyberGuard-AI
   ```

2. Create a Python virtual environment:
   ```powershell
   python -m venv .venv
   ```

3. Install required Python packages directly using the virtual environment executable (bypasses script execution policy restrictions):
   ```powershell
   .\.venv\Scripts\python.exe -m pip install fastapi uvicorn pydantic pytest httpx
   ```
   *(Alternatively, if script execution is allowed in PowerShell: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass; .\.venv\Scripts\Activate.ps1`)*

4. Launch the FastAPI backend server:
   ```powershell
   .\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload
   ```

#### Linux / macOS

1. Open a terminal and navigate to the project root directory:
   ```bash
   cd CyberGuard-AI
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install fastapi uvicorn pydantic pytest httpx
   ```

4. Launch the FastAPI backend server:
   ```bash
   uvicorn backend.main:app --reload
   ```

The backend server will run at `http://127.0.0.1:8000`. Interactive OpenAPI documentation (Swagger UI) is available at `http://127.0.0.1:8000/docs`.

---

### 2. Running the Frontend Locally

#### Windows (PowerShell)

1. Open a terminal and navigate to the `frontend/` directory:
   ```powershell
   cd frontend
   ```

2. Install Node.js dependencies:
   ```powershell
   npm.cmd install
   ```

3. Start the Vite development server:
   ```powershell
   npm.cmd run dev
   ```

#### Linux / macOS

1. Open a terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies and start the dev server:
   ```bash
   npm install
   npm run dev
   ```

The React dashboard application will open at `http://localhost:5173`.

---

### 3. Local Storage & Database Management

- **SQLite Database**: The backend uses a local SQLite database (`backend/cyberguard.db`) for scan persistence. The `scan_history` database table is created automatically when the FastAPI application initializes.
- **Git Exclusions**: The SQLite database file (`backend/cyberguard.db`), virtual environment (`.venv/`), and Node modules (`node_modules/`) are listed in `.gitignore` and excluded from version control.

---

## Testing

The project includes an automated test suite implemented with `pytest` and FastAPI's `TestClient`.

### Running the Test Suite

- **Windows (PowerShell)**:
  ```powershell
  .\.venv\Scripts\python.exe -m pytest
  ```
- **Linux / macOS**:
  ```bash
  pytest
  ```

### Verified Test Suite Breakdown

The current test suite contains **12 verified automated tests** across three test modules (`test_http.py`, `test_analytics.py`, `test_detection.py`), all 12 of which currently pass:

- **API Health Endpoints**: Verifies successful `200 OK` responses for `GET /` and `GET /api/health`.
- **Input Validation & Normalization**:
  - Validates that leading/trailing whitespace in target strings and target types is successfully normalized and processed with a `200 OK` response.
  - Confirms that invalid inputs return `HTTP 422 Unprocessable Entity` (empty strings, whitespace-only strings, overlong strings exceeding 2048 characters, and unsupported target types).
- **Rule-Based Threat Detection**: Verifies pattern matching for SQL Injection, Cross-Site Scripting (XSS), and high/medium risk threat keywords.
- **Database Persistence & Analytics**: Tests scan record saving to SQLite, history retrieval, and dynamic updating of backend analytics counters (`total_scans`, `high_count`, etc.) upon submitting a scan.

---

## Future Improvements (Planned Work)

The following features are NOT currently implemented and represent planned future enhancements:

- **ML-Based Threat Classification**: Training and deploying machine learning models (using Scikit-learn / PyTorch in `ml/`) for heuristic threat classification and anomaly detection.
- **External Threat Intelligence Integration**: Connecting third-party reputation lookup services (such as VirusTotal, AbuseIPDB, or AlienVault OTX) for live enrichment.
- **User Authentication & Authorization**: Implementing JWT authentication and role-based access control (RBAC).
- **Automated Notifications & Alerts**: Adding email notifications or webhook alerts triggered by high-severity threat detections.
- **Production Database Support**: Adding configuration support for PostgreSQL / MySQL in production deployments.
- **Containerization & Deployment**: Packaging backend and frontend services using Docker and Docker Compose.


