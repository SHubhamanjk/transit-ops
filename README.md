# TransitOps

TransitOps is a comprehensive Transit and Fleet Management System designed to streamline the operations of logistics and transportation companies. It provides an intuitive interface and robust backend to manage vehicles, drivers, trips, maintenance logs, and financial statistics efficiently.

## What it does
- **Dashboard Analytics:** Visualizes KPIs such as total operational costs, active trips, and fleet utilization.
- **Vehicle Management:** Register and track vehicles (trucks, vans, buses, sedans), their status (Available, On Trip, In Shop, Retired), capacities, and acquisition costs.
- **Driver Management:** Manage driver profiles, track their statuses (Available, On Trip, Off Duty, Suspended), and monitor safety scores and total run times.
- **Trip Dispatching:** Create, dispatch, complete, and cancel trips. Assign available drivers and vehicles to specific routes while ensuring cargo capacities and driver licenses are valid.
- **Maintenance Logging:** Schedule and log vehicle maintenance, estimating durations and tracking final costs to keep the fleet in top condition.
- **OTP Authentication Flow:** Secure login and identity verification using One-Time Passwords (OTPs) sent to the user.
- **Automated Reminders & Cron Jobs:** Background cron jobs automatically track and send alerts for:
  - Driver license expiries.
  - Overdue vehicle maintenance.

---

## Tech Stack
- **Frontend:** React, TypeScript, Vite, React Router, CSS
- **Backend:** Python, FastAPI, SQLAlchemy (Async), Pydantic, PostgreSQL, APScheduler (for cron jobs)
- **Authentication:** JWT (JSON Web Tokens), bcrypt for password hashing, OTP-based flows

---

## Project Structure
```text
transit-ops/
├── backend/
│   ├── app/
│   │   ├── core/           # Security, config, and core utilities (OTP, Email sender)
│   │   ├── db/             # Database connection and SQLAlchemy models
│   │   ├── modules/        # API routers, services, and schemas (auth, drivers, maintenance, trips, vehicles)
│   │   └── services/       # Background tasks & Cron Jobs (Stats, Expiry Reminders)
│   ├── main.py           # FastAPI application entry point
│   └── requirements.txt  # Python dependencies
└── frontend/
    ├── src/
    │   ├── api/            # API client configurations and endpoints integration
    │   ├── assets/         # Images and icons
    │   ├── components/     # Reusable UI components (Sidebar, Modals, SearchableSelect)
    │   ├── context/        # React context (AuthContext)
    │   ├── pages/          # Main application views (Dashboard, Vehicles, Drivers, Trips, Maintenance)
    │   └── routes/         # Application routing
    ├── index.html
    ├── package.json
    └── vite.config.ts
```

---

## Backend APIs and Modules

The backend follows a modular monolith approach, organized into the following domains:

### 1. Auth Module (`/auth`)
Handles user registration, login, token generation, and OTP verification.
- **Endpoints:** `POST /register`, `POST /login`, `POST /verify-otp`
- **Schemas:** `UserCreate`, `UserResponse`, `Token`, `OTPVerify`

### 2. Dashboard Module (`/dashboard`)
Serves pre-calculated key performance indicators (KPIs) to the frontend.
- **Endpoints:** `GET /kpis`
- **Schemas:** Key-value pairs of statistics.

### 3. Drivers Module (`/drivers`)
Manages the workforce behind the wheel.
- **Endpoints:** `GET /`, `GET /{id}`, `POST /`, `GET /dropdown`
- **Schemas:** `DriverCreate`, `DriverResponse`, `DriverDropdownResponse`

### 4. Vehicles Module (`/vehicles`)
Maintains the fleet registry and real-time vehicle statuses.
- **Endpoints:** `GET /`, `GET /{id}`, `POST /`, `GET /dropdown`
- **Schemas:** `VehicleCreate`, `VehicleResponse`, `VehicleDropdownResponse`

### 5. Trips Module (`/trips`)
The core operational module for planning and executing deliveries/transport.
- **Endpoints:** `GET /`, `GET /{id}`, `POST /`, `PUT /{id}/dispatch`, `PUT /{id}/complete`, `PUT /{id}/cancel`
- **Schemas:** `TripCreate`, `TripResponse`, `TripComplete`

### 6. Maintenance Module (`/maintenance`)
Keeps track of repair schedules and logs.
- **Endpoints:** `GET /`, `POST /`
- **Schemas:** `MaintenanceCreate`, `MaintenanceResponse`, `MaintenanceComplete`

---

## Data Schemas & ER Diagram

![ER Diagram](./er%20diagram%20of%20db-2026-07-12-124807.png)

---

## Setup Steps

### 1. Clone the repository
```bash
git clone https://github.com/SHubhamanjk/transit-ops
cd transit-ops
```

### 2. Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
pip install -r requirements.txt
```

**Environment Variables (`backend/.env`):**
Create a `.env` file in the `backend/` directory:
```env
# Database Configuration
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/transitops

# Security Settings
SECRET_KEY=your_super_secret_jwt_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Email/SMTP Configuration (For OTP & Automated Reminders)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=noreply@transitops.com
```

**Run the Backend:**
```bash
uvicorn main:app --reload
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

**Environment Variables (`frontend/.env`):**
Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://127.0.0.1:8000/api
```

**Run the Frontend:**
```bash
npm run dev
```

---

## Credits
- **Backend:** done by Shubham
- **Frontend:** done by Nidhi

*Built under the Odoo Hackathon 2026*
