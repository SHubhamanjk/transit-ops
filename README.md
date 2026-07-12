# TransitOps: Smart Transport Operations Platform

TransitOps is an end to end fleet and transport management platform that helps logistics and transportation companies digitize their daily operations. It replaces manual spreadsheets and paperwork with a centralized system to manage vehicles, drivers, trips, maintenance, fuel, expenses, and operational analytics.

## Business Problems It Solves

Many transport companies still rely on manual processes, leading to vehicle scheduling conflicts, double assignments, missed maintenance, expired driver licenses, inaccurate expense tracking, and limited operational visibility. These issues increase operational costs, reduce fleet utilization, and affect service reliability.

TransitOps addresses these challenges by automating transport operations, enforcing business rules, and providing real time insights to improve efficiency, reduce errors, and support better decision making.

## Key Features

* **Interactive Dashboard:** Monitor fleet utilization, active trips, operational costs, vehicle availability, and other key performance indicators in real time.
* **Vehicle Management:** Register and manage vehicles, track their status, capacity, odometer, and lifecycle.
* **Driver Management:** Maintain driver profiles, monitor license validity, safety scores, availability, and duty status.
* **Smart Trip Dispatching:** Create, dispatch, complete, and cancel trips with automatic validation for vehicle availability, driver eligibility, and cargo capacity.
* **Maintenance Management:** Schedule and track vehicle maintenance while automatically preventing vehicles under maintenance from being assigned to new trips.
* **Fuel & Expense Tracking:** Record fuel consumption, maintenance costs, tolls, and other operational expenses to monitor overall fleet costs.
* **Secure Authentication:** OTP based authentication with role based access control for secure access.
* **Automated Alerts:** Background jobs continuously monitor driver license expiries and upcoming maintenance, sending timely reminders before they become operational issues.
* **Business Analytics:** Generate actionable insights into fleet utilization, fuel efficiency, operational costs, and vehicle performance to support data driven decisions.

TransitOps transforms transport operations into a smarter, automated, and data driven workflow, helping organizations improve fleet utilization, reduce operational costs, ensure compliance, and make faster business decisions.


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
