# <a href="https://pravah-proj.vercel.app/">Pravah (प्रवाह)</a>

> Data Driven Real-Time Delhi Flood Risk Monitoring & Management System

<img width="1351" height="682" alt="image" src="https://github.com/user-attachments/assets/5bf755f7-76d8-4b7b-8b7d-ed249a3f7dc1" />

**Live Demo:** https://pravah-proj.vercel.app/


A comprehensive, data-driven dashboard designed to help city administrators monitor, predict, and manage urban flood risks in real-time. 
It integrates rainfall data, drainage capacity, and citizen complaints to generate dynamic risk scores for 250 municipal wards in Delhi.

## ✨ Features

- **Real-Time Risk Engine** — Dynamic algorithm calculating risk scores (0-100) based on rainfall (mm), drainage capacity (%), and active complaints.
- **Interactive City Map** — Visualizes 250 wards with color-coded risk markers (Red/Yellow/Green) and pulse animations for high-risk zones.
- **Dual-Role Interface** — 
1. *Citizen Portal:* Submit geo-tagged waterlogging complaints bala 
2. *Admin Dashboard*: Monitor KPIs, view ward-level analytics, and update infrastructure status.
- **Professional Visualization** — Clean, government-grade UI with data-dense tables and actionable insights.
- **Dual Themes** — Both light mode and dark mode implemented to suit all users.
- **Simulated IoT Data** — Realistic, synchronized datasets for Rainfall and Drainage across all Delhi zones.

## 🏗️ Architecture

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  IoT Sensors │      │   Citizen    │      │    Admin     │
│ (Rain/Drain) │      │  Reporting   │      │   Actions    │
└──────┬───────┘      └──────┬───────┘      └──────┬───────┘
       │                     │                     │
       ▼                     ▼                     ▼
┌──────────────────────────────────────────────────────────┐
│                   Data Aggregation Layer                 │
│              (CSV / In-Memory State Store)               │
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│                    Risk Engine (Python)                  │
│   Formula: (Drainage * 0.5) + (Rain * 0.3) + (Logs * 0.2)│
└────────────────────────────┬─────────────────────────────┘
                             │
                             ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   REST API   │◀───▶│   Frontend   │◀ ──▶│ Leaflet Maps │
│  (FastAPI)   │      │  (HTML/JS)   │      │ (Visuals)    │
└──────────────┘      └──────────────┘      └──────────────┘
```

## 📁 Project Structure

```
Pravah/
├── backend/
│   ├── data/
│   │   ├── wards.csv           # 250 Ward Geo-coordinates & Zones
│   │   ├── rainfall.csv        # Live Rainfall Data (mm)
│   │   ├── drainage.csv        # Infrastructure Capacity (%)
│   │   └── complaints.csv      # Citizen Report Log
│   │
│   ├── src/
│   │   ├── main.py             # FastAPI Entry Point & CORS
│   │   ├── config.py           # Settings & Constants
│   │   ├── models.py           # Pydantic Schemas
│   │   └── services/
│   │       ├── api.py          # API Route Handlers
│   │       ├── data_loader.py  # CSV Parsing & Merging Logic
│   │       ├── risk_engine.py  # Risk Calculation Algorithm
│   │       └── admin_ops.py    # Admin Action Logic
│   │
│   └── requirements.txt        # Python Dependencies
│
├── frontend/
│   ├── css/
│   │   ├── styles.css          # Main Theme & Responsive Rules
│   │   ├── admin.css           # Dashboard Specific Styles
│   │
│   ├── js/
│   │   ├── common.js           # API Config & Utilities
│   │   ├── admin.js            # Dashboard Logic & Maps
│   │   ├── dashboard.js        # Citizen Map & Reporting
│   │   ├── complaints.js       # Form Handling
│   │   └── login.js            # Auth Logic
│   │
│   ├── index.html              # Landing Page
│   ├── admin.html              # Main Admin Control Room
│   ├── dashboard.html          # Citizen Reporting Page
│   └── login.html              # Admin Login Gate
│   └── about.html              # About The Project
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Web Browser(Desktop Mode for now)
- Git

### 1. Clone & Setup

```powershell
# Clone the repository
git clone https://github.com/prabhatbhatiaa/pravah.git
cd pravah

# Backend Setup
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate # Mac/Linux

# Install dependencies
pip install -r requirements.txt
```

### 2. Runs the Backend
```env
# Start Uvicorn Server
uvicorn src.main:app --reload
```

### 3. Run the Frontend
```powershell
1. Open the frontend folder.
2. Open index.html via Live Server (VS Code Extension) or simply double-click it.
3. Important: Ensure frontend/js/common.js points to http://localhost:8000 for local development.
```

## 🔐 System Access

1. **Landing Page** — : Public access to project overview.
2. **About Us Page** — : Public accessto the details of the project.
3. **Citizen Dashboard** — Public access to view map & report issues.
4. **Admin Portal** — : Restricted access via Session Storage.

## 📋 API Endpoints

### Public
- `GET /api/wards` — Returns full GeoJSON of all 250 wards with calculated risk.
- `GET /api/risk-summary` — Returns aggregate stats (High Risk count, Total Wards).
- `POST /api/complaint` — Submit a new citizen complaint.

### Admin
- `GET /api/admin/overview` — Returns detailed tabular data sorted by risk.
- `POST /api/admin/update-drainage` — Update drainage capacity for a specific ward.

## 🧠 Risk Calculation Logic
```The Risk Engine (risk_engine.py) calculates a score (0-100) for every ward in real-time```
1. **Drainage Factor (50%):** Inverse of capacity. Lower drainage = Higher risk.
2. **Rainfall Factor (30%):** Normalized against a critical threshold (150mm).
3. **Complaint Factor (20%):** Active complaints boost the risk score significantly.

```python
Final Score = (Drainage_Risk * 0.5) + (Rainfall_Risk * 0.3) + (Complaint_Risk * 0.2)
```

## 🛠️ Technology Stack

### Backend:
- **FastAPI** — High-performance Python framework.
- **Pandas** — Data manipulation and CSV handling.
- **Uvicorn** — ASGI Server.

### Frontend:
- **HTML5 / CSS3** — Responsive layout with CSS Variables.
- **Vanilla JavaScript** — Logic without heavy frameworks.
- **Leaflet.js** — Interactive Maps & Marker rendering.

## Deployment:
- **Render** — Python Backend Hosting.
- **Vercel** — Static Frontend Hosting.

## 📦 Dependencies

```txt
fastapi
uvicorn
pandas
pydantic
python-multipart
```
##### Create `backend/requirements.txt` with the above and run:

```powershell
pip install -r backend/requirements.txt
```

## 🔒 Security Considerations

- **Session Storage Auth** — Basic client-side session management for the hackathon prototype.
- **CORS Configuration** — Backend restricted to specific origins in production.

## 🐛 Troubleshooting

**Map not loading:**
- Check if the Backend URL in ```frontend/js/common.js``` matches your running server.
- Ensure no trailing slash in the API base URL (e.g., ```https://api.com``` not ```https://api.com/```).

**Admin page redirects to login:**
- Ensure you actually logged in via ```login.```html to set the session key.
- Check browser console for ```sessionStorage``` errors.

**High latency on first load:**
- The backend is hosted on a free Render instance which spins down after inactivity. The first request might take 50 seconds to wake it up.

## 🎯 Roadmap

- [ ] Integration with live IMD Weather API.
- [ ] IoT Sensor integration for real-time water level monitoring.
- [ ] SMS Alerts to citizens in High-Risk zones.
- [ ] Predictive AI model for 24hr flood forecasting.
- [ ] Mobile-responsive UI improvements


## 👤 Author

**Prabhat Bhatia** &
**Suhani Yadav**

---

**Note:** This project was built for a govt level hackathon. The data for "Rainfall" and "Drainage" is simulated based on real-world Delhi ward boundaries and flood hotspots.
