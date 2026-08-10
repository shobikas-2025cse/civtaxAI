# 🏛️ CivTax AI — Smart Municipal Tax Platform

> **AI-Powered Civic Revenue Intelligence & Gamified Municipal Tax Collection System**  
> Built for Urban Local Bodies (ULBs) & Municipal Corporations to transform property tax compliance through AI behavioral nudging, CRED-style Civic Credit Scoring, dynamic rebate incentives, and real-time ward operations tracking.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Frontend Architecture](#-frontend-architecture)
- [Backend Architecture & API Endpoints](#-backend-architecture--api-endpoints)
- [Dual Runtime Architecture (Hybrid Backend & Offline Mode)](#-dual-runtime-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Frontend](#running-the-frontend)
  - [Running the FastAPI Backend](#running-the-fastapi-backend)
- [User Roles & Workflows](#-user-roles--workflows)
- [Design System & Theme](#-design-system--theme)
- [License](#-license)

---

## 🌟 Overview

**CivTax AI** is an end-to-end municipal tax revenue ecosystem designed to solve property and civic tax under-collection in Indian urban governance. By combining open standards (inspired by DIGIT / UPYOG) with modern fintech UX, behavioral economics, and AI risk prediction, CivTax AI bridges the gap between citizens and municipal administrators.

### Core Problems Solved:
1. **Low Citizen Compliance & Late Payments:** Traditional municipal portals are cumbersome and punitive. CivTax AI introduces positive reinforcement via Civic Credit Scores (300–900), instant scratch-card rewards, milestone badges, and interest-free instalment plans with AutoPay.
2. **Defaulter Inefficiency for Field Collectors:** Tax collectors previously operated with static, outdated lists. CivTax AI provides an 8-module operations workstation with interactive ward heatmaps, predictive AI defaulter triage, one-tap WhatsApp nudges, and digital doorstep receipt logging.
3. **Delayed Policy Rollout for Admins:** Municipal administrators can configure tax brackets, early-bird discounts, and penalty interest schedules, instantly propagating rules across the entire municipal network with zero downtime.

---

## 🚀 Key Features

### 👤 Citizen Portal
- **CRED-Style Civic Credit Score (300–900):** Real-time credit scoring reflecting on-time payments, compliance streaks, and community pledges.
- **Dynamic Bill Breakdown:** Granular assessments for Property Tax, Water Tax, and Solid Waste Management.
- **Flexible Payment Options:**
  - **Lump-Sum Payment:** Early-bird 5% instant discount + exclusive Gold Citizen reward certificate.
  - **Interest-Free EMI Instalments:** Split annual taxes into 12 monthly or 4 quarterly instalments.
  - **AutoPay (e-NACH / UPI Auto-Debit):** Additional 2% recurring discount + automatic streak maintenance.
- **Interactive Gamification & Rewards:** Unlockable tiers (Gold Model Citizen, Silver Contributor), XP points, and municipal perks (e.g. VIP parking passes, fast-track trade licenses).
- **Post-Payment Scratch Cards:** Instant confetti celebration, municipal reward vouchers, and downloadable digital receipts.

### 🤖 CivTax AI Assistant
- **Predictive Risk Assessment Engine:** Proactively forecasts penalty surcharges and property flag risks.
- **Conversational Intelligence:** Answers questions regarding property assessments, penalty rules, rebate schemes, and amnesty waivers.

### 👮 Tax Collector Operations Module
- **Live Revenue Strip:** Real-time metrics for Total Collected (YTD), Compliance Rate, Pending Dues, and AutoPay enrollment.
- **Interactive Ward Heat Map & Zone Risk Inspector:** Clickable zone cards (Green, Yellow, Red risk tiers) across 8 Bangalore wards with instant citizen breakdowns.
- **Ward Citizens & Member Directory:** Searchable resident roster with real citizen names, property IDs, outstanding dues, risk tags, and action triggers.
- **Priority Defaulter & Recovery Queue:** High-risk accounts sorted by days overdue with bulk WhatsApp/SMS nudge dispatchers.
- **Doorstep Collection Logger:** Field officer modal to record offline UPI/cash collections, generate instant transaction IDs, and update municipal databases.
- **AutoPay Mandates & Recurring Sweeps:** Real-time visibility into scheduled debit waves and mandate success rates.
- **Scoreboard & Officer Leaderboard:** Inter-ward municipal efficiency rankings and collector achievement badges.

### ⚙️ Administrator Control Room
- **Tax Policy Rule Configurator:** Adjust base residential/commercial tax rates, early-bird rebates, and penalty interest curves.
- **Instant Policy Propagation:** One-click sync across all citizen portals, collector field tools, and external DIGIT open APIs.
- **Ward Officer Allocations & Audit Logs:** Live tracking of officer assignments and timestamped system activities.

---

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph Frontend ["Frontend (React 18 + Vite + Tailwind/Vanilla CSS)"]
        UI[App Shell & Routing]
        Auth[AuthContext & Mock OTP]
        Pages[Citizen Portal | Collector Dashboard | Admin Room | AI Assistant | Rewards]
        ServiceLayer[Service Layer: citizenService, collectorService, wardService, taxService, adminService]
        ApiClient[Unified ApiClient with Auto-Fallback]
    end

    subgraph DataSources ["Data Sources & Storage"]
        FastAPI["FastAPI Backend (http://localhost:8000/api/v1)"]
        SQLiteDB[(SQLite Database: civtax.db)]
        BundledCSV["Pre-bundled Dataset (csvDataLoader: 300 Citizens, 8 Wards, 500+ Txns)"]
    end

    UI --> Pages
    Pages --> ServiceLayer
    ServiceLayer --> ApiClient
    ApiClient -->|Backend Online| FastAPI
    FastAPI --> SQLiteDB
    ApiClient -.->|Backend Offline (Fallback)| BundledCSV
```

---

## 💻 Technology Stack

### Frontend
- **Framework:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing:** [React Router v6](https://reactrouter.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Styling:** Vanilla CSS + Tailwind CSS utilities with a custom Luxury Matte & Mustard Gold design system
- **Effects:** Canvas Confetti for gamification rewards

### Backend
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+)
- **Server:** [Uvicorn](https://www.uvicorn.org/) (ASGI)
- **ORM & Database:** [SQLAlchemy](https://www.sqlalchemy.org/) with SQLite (`civtax.db`)
- **Data Validation:** [Pydantic](https://docs.pydantic.dev/)
- **Security & Middleware:** CORS Middleware configured for frontend integration

---

## 📁 Project Directory Structure

```
SmartAIthon_proj/
├── backend/                        # FastAPI Backend Application
│   ├── routers/                    # Modular API Route Controllers
│   │   ├── admin.py                # Admin metrics, rules, officers, activity logs
│   │   ├── ai.py                   # Conversational AI & risk scoring engine
│   │   ├── citizens.py             # Citizen queries, search, auth & updates
│   │   ├── collector.py            # Revenue metrics, stages, defaulters queue
│   │   └── taxes.py                # Tax calculations & payment processing
│   ├── civtax.db                   # SQLite database instance
│   ├── crud.py                     # Database CRUD queries & analytical computations
│   ├── database.py                 # SQLAlchemy DB engine & session setup
│   ├── main.py                     # FastAPI application entry point & CORS
│   ├── models.py                   # SQLAlchemy ORM database models
│   ├── requirements.txt            # Python dependencies
│   ├── schemas.py                  # Pydantic request/response schemas
│   └── seed.py                     # Database seeder script
│
├── src/                            # Frontend React Application
│   ├── components/                 # Reusable UI Components & Modals
│   │   ├── GamificationDetailModals.jsx # Deep-dive dialogs for Civic Score & Perks
│   │   ├── Navbar.jsx              # Global navigation, role badge, notifications
│   │   └── PostPaymentRewardModal.jsx   # Scratch card & confetti rewards modal
│   │
│   ├── context/                    # State Management
│   │   └── AuthContext.jsx         # User auth, roles, demo profiles, mock OTP
│   │
│   ├── data/                       # Pre-bundled Municipal CSV Datasets
│   │   ├── alerts.csv              # Defaulter notifications & dynamic rebate alerts
│   │   ├── citizens.csv            # 300 rich Indian citizen records across 8 wards
│   │   ├── leaderboard.csv         # Civic taxpayer leaderboard rankings
│   │   ├── monthly_trend.csv       # FY 2025-26 monthly collection trends
│   │   ├── summary.csv             # City-wide revenue & compliance summary
│   │   └── wards.csv               # 8 Bangalore municipal wards metadata
│   │
│   ├── pages/                      # Application Page Views
│   │   ├── AIChatbotPage.jsx       # AI Tax Assistant & predictive risk panel
│   │   ├── AdminPage.jsx           # Municipal admin control room & policy engine
│   │   ├── DashboardPage.jsx       # Citizen dashboard & Civic Credit Score
│   │   ├── LoginPage.jsx           # Behance-style login & quick demo role picker
│   │   ├── PayTaxPage.jsx          # Payment gateway, EMI instalments & AutoPay
│   │   ├── RewardsPage.jsx         # Gamified badges, XP points & perks
│   │   └── TaxCollectorPage.jsx    # 8-module Tax Collector operations workstation
│   │
│   ├── services/                   # Service Layer & API Integration
│   │   ├── adminService.js         # Admin metrics, officer allocation, audit logs
│   │   ├── aiService.js            # AI Q&A engine & risk scoring
│   │   ├── apiClient.js            # Unified API Client with auto-fallback
│   │   ├── citizenService.js       # Citizen directory, filters, leaderboard
│   │   ├── collectorService.js     # Collector KPIs, payment split, defaulters
│   │   ├── csvDataLoader.js        # Instant zero-latency pre-bundled loader
│   │   ├── csvParser.js            # High-performance CSV parser
│   │   ├── index.js                # Services barrel exporter
│   │   ├── taxService.js           # Tax assessments, receipts, payment simulation
│   │   └── wardService.js          # Ward risk tiers, efficiency & zone inspector
│   │
│   ├── App.jsx                     # Route definitions & layout wrappers
│   ├── index.css                   # Global styling, tokens & matte dark theme
│   └── main.jsx                    # React DOM entry point
│
├── package.json                    # Node dependencies & npm scripts
├── vite.config.js                  # Vite bundler configuration
└── README.md                       # Project Documentation
```

---

## 🎨 Frontend Architecture

The frontend is built using **React 18** with component modularity and decoupled state management:

1. **Auth & Role Switcher (`AuthContext.jsx`):** Supports instant switching between 4 personas for demonstration purposes:
   - **Compliant Citizen** (e.g., Priya Patel — 840 Civic Score, 0 dues, AutoPay enabled).
   - **Pending Citizen** (e.g., Rajesh Sharma — 680 Civic Score, current cycle dues).
   - **Overdue Defaulter** (e.g., Suresh Kumar / Anil Reddy — 520 Civic Score, high-risk arrears).
   - **Tax Collector Officer** (Officer Anand Verma — Zone 4 Koramangala).
   - **Municipal Administrator** (System Admin).
2. **Design Tokens (`index.css`):**
   - **Backdrop:** Warm luxury cream / soft beige gradient (`.app-theme-bg`).
   - **Containers:** Deep matte black (`#12141C` / `#151822`) with subtle `#262B3A` borders.
   - **Accents:** Vibrant mustard gold (`#E5B80B` / `#D1A000`) for primary buttons, active tabs, and badges.
   - **Typography:** Inter & Outfit sans-serif with high contrast white/gold text inside dark cards.

---

## ⚙️ Backend Architecture & API Endpoints

The backend is built on **FastAPI** with structured routers mounted at `/api/v1/`:

| Router | Method | Endpoint | Description |
|---|---|---|---|
| **Citizens** | `GET` | `/api/v1/citizens` | List all citizens with filters (ward, status, search) |
| **Citizens** | `GET` | `/api/v1/citizens/{id}` | Get citizen profile by ID |
| **Citizens** | `GET` | `/api/v1/citizens/phone/{phone}` | Get citizen profile by Phone |
| **Citizens** | `PUT` | `/api/v1/citizens/{id}` | Update citizen records (AutoPay, address, phone) |
| **Taxes** | `GET` | `/api/v1/taxes/citizen/{citizen_id}` | Fetch tax bills & assessment items for a citizen |
| **Taxes** | `POST` | `/api/v1/taxes/pay` | Record tax payment, apply discounts & update dues |
| **Taxes** | `GET` | `/api/v1/transactions` | Retrieve historical payment transactions |
| **Collector** | `GET` | `/api/v1/collector/metrics` | Retrieve live municipal collection KPIs |
| **Collector** | `GET` | `/api/v1/collector/stages` | Get collection stage breakdown percentages |
| **Collector** | `GET` | `/api/v1/collector/payment-methods` | Get payment method split distribution |
| **Collector** | `GET` | `/api/v1/collector/defaulters` | Fetch priority defaulter recovery queue |
| **Wards** | `GET` | `/api/v1/wards` | List 8 municipal wards with efficiency rates & risk tiers |
| **Leaderboard** | `GET` | `/api/v1/leaderboard` | Top compliant taxpayers leaderboard |
| **Admin** | `GET` | `/api/v1/admin/metrics` | City-wide administration revenue metrics |
| **Admin** | `GET` | `/api/v1/admin/officers` | List municipal tax officers and ward assignments |
| **Admin** | `GET` | `/api/v1/admin/logs` | Fetch timestamped system activity logs |
| **Admin** | `POST` | `/api/v1/admin/rules/propagate` | Propagate updated tax rates across municipal engine |
| **AI** | `POST` | `/api/v1/ai/chat` | Conversational assistant query handler |
| **AI** | `GET` | `/api/v1/ai/risk-profile/{citizen_id}` | Calculate AI risk assessment and penalty forecast |

---

## 🔄 Dual Runtime Architecture

CivTax AI features a **fail-safe service layer** designed for flexible development, demos, and production:

1. **Live Backend Mode:**
   - When the FastAPI backend is running on `http://localhost:8000`, the frontend automatically sends REST calls to the database.
2. **Automatic Offline / Standalone Mode:**
   - If the FastAPI backend is not running, [apiClient.js](file:///d:/SmartAIthon_proj/src/services/apiClient.js) automatically catches the network state and seamlessly switches to the pre-bundled local municipal dataset ([csvDataLoader.js](file:///d:/SmartAIthon_proj/src/services/csvDataLoader.js)).
   - **Zero configuration or manual toggling is required** — all 300 citizens, 8 wards, revenue analytics, and interactive modals function flawlessly out-of-the-box.

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher, for backend)
- **npm** or **yarn**

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shobikas-2025cse/civtaxAI.git
   cd civtaxAI
   ```

2. **Install Frontend Dependencies:**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies (Optional for Live DB Mode):**
   ```bash
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

---

### Running the Frontend

To start the Vite development server:
```bash
npm run dev
```
Open your browser and navigate to: **`http://localhost:5173`**

---

### Running the FastAPI Backend (Optional)

In a separate terminal:
```bash
uvicorn backend.main:app --reload --port 8000
```
- **API Base URL:** `http://localhost:8000/api/v1`
- **Interactive Swagger API Docs:** `http://localhost:8000/docs`
- **ReDoc Documentation:** `http://localhost:8000/redoc`

---

## 👥 User Roles & Workflows

| Role | Demo Persona | Primary Flow | Key View |
|---|---|---|---|
| **Citizen (Compliant)** | Priya Patel | View zero dues, maintain streak, view unlocked perks | `/dashboard`, `/rewards` |
| **Citizen (Pending)** | Rajesh Sharma | View quarterly dues, claim 5% early-bird discount, pay via UPI | `/dashboard`, `/pay-tax` |
| **Citizen (Overdue)** | Suresh Kumar / Anil Reddy | View overdue warning, explore 12-month EMI, activate Amnesty waiver | `/dashboard`, `/pay-tax`, `/ai-assistant` |
| **Tax Collector** | Officer Anand Verma | Inspect Ward 4 Koramangala, dispatch WhatsApp nudges, log doorstep collections | `/collector` |
| **Administrator** | System Admin | Adjust property tax brackets, allocate officers, audit logs | `/admin` |

---

## 🎨 Design System & Theme

- **Warm Luxury Backdrop:** Rich blend of warm cream, soft beige, and subtle mustard tones.
- **Deep Matte Containers:** `#12141C` and `#151822` backgrounds providing high contrast and modern depth.
- **Mustard Gold Highlights:** `#E5B80B` and `#D1A000` accents for active indicators, primary CTAs, and progress bars.
- **Visual Feedback:** Micro-animations, SVG sparklines, dial progress meters, and celebratory reward modals.

---

## 📄 License

This project was developed for the **SmartAIthon 2026 Hackathon**. Distributed under the **MIT License**.
