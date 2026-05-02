# 🛡️ Incident Management System (IMS)

A mission-critical Incident Management System built for the Zeotap Infrastructure/SRE Intern Assignment.

## 🏗️ Architecture
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   React UI  │────▶│  FastAPI    │────▶│  PostgreSQL │
│  :3000      │     │  Backend    │     │  (WorkItems)│
└─────────────┘     │  :8000      │     └─────────────┘
│             │────▶│  MongoDB    │
│             │     │  (Signals)  │
│             │────▶│  Redis      │
└─────────────┘     │  (Cache)    │
└─────────────┘
## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI, Uvicorn |
| Frontend | React.js |
| Raw Signal Store | MongoDB |
| Source of Truth | PostgreSQL |
| Cache / Hot-path | Redis |
| Containerization | Docker + Docker Compose |

## ✨ Features

- **High-throughput signal ingestion** with rate limiting (1000 req/sec per IP)
- **Debouncing logic** — 100 signals from same component in 10s = 1 WorkItem
- **Strategy Pattern** — different alert severity per component type (P0-P3)
- **State Machine** — OPEN → INVESTIGATING → RESOLVED → CLOSED
- **Mandatory RCA** — cannot close without Root Cause Analysis
- **MTTR Calculation** — auto-calculated from start/end time
- **Redis Cache** — dashboard state cached, avoids DB hits on every refresh
- **Live Dashboard** — auto-refreshes every 10 seconds
- **/health endpoint** — for monitoring
- **Throughput metrics** — printed to console every 5 seconds

## 🚀 Setup Instructions

### Prerequisites
- Docker Desktop installed and running
- Node.js 18+
- Python 3.11+

### Option 1: Docker Compose (Recommended)

```bash
git clone https://github.com/YOUR_USERNAME/ims-zeotap.git
cd ims-zeotap
docker-compose up --build
```

Then open http://localhost:3000

### Option 2: Manual Setup

**Start databases:**
```bash
docker run -d --name ims-mongo -p 27017:27017 mongo:7
docker run -d --name ims-redis -p 6379:6379 redis:7
docker run -d --name ims-postgres \
  -e POSTGRES_USER=ims_user \
  -e POSTGRES_PASSWORD=ims_pass \
  -e POSTGRES_DB=ims_db \
  -p 5432:5432 postgres:15
```

**Start backend:**
```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

**Start frontend:**
```bash
cd frontend
npm install
npm start
```

## 🧪 Simulate a Failure

```bash
cd ims-zeotap
python simulate_failure.py
```

This simulates an RDBMS outage cascading into cache and API failures.

## 📊 How Backpressure is Handled

1. **In-memory queue via async tasks** — FastAPI handles requests asynchronously so slow DB writes don't block ingestion
2. **Rate Limiter** — caps ingestion at 1000 signals/sec per client IP
3. **Debouncer** — collapses burst signals into single WorkItems, reducing DB writes by up to 100x
4. **Redis cache** — serves dashboard from cache, protecting PostgreSQL from read storms

## 🔒 Security (Bonus)

- CORS middleware configured
- Rate limiting on ingestion endpoint
- Input validation via Pydantic models

## 📁 Project Structure