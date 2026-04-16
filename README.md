# Cal.com Clone

> A full-stack scheduling application demo built with Next.js + FastAPI, mirroring core Cal.com functionality.

🔗 **Live Demo:** [cal-com-mu.vercel.app](https://cal-com-mu.vercel.app) &nbsp;|&nbsp; 🛠️ **Backend API:** [cal-com-qecy.onrender.com](https://cal-com-qecy.onrender.com)

---

## Overview

A full-stack demonstration of Cal.com's core functionality — a Next.js frontend serving scraped Cal.com pages alongside a FastAPI backend for managing event types and scheduling data, all backed by a serverless Neon PostgreSQL database.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14.2, React 18.3, Cheerio 1.1 |
| Backend | FastAPI 0.115, Uvicorn 0.34, SQLAlchemy 2.0 |
| Database | Neon PostgreSQL (serverless) |
| Deployment | Vercel (frontend) · Render.com (backend) |

---

## Project Structure

```
cal/
├── frontend/
│   ├── app/
│   │   ├── layout.jsx          # Root layout
│   │   ├── page.jsx            # Home page
│   │   ├── dashboard/          # Event management
│   │   ├── meeting/            # Meeting scheduler
│   │   ├── login/ & signup/    # Auth pages
│   │   └── components/         # Reusable UI
│   ├── lib/
│   │   ├── apiClient.js        # Backend communication
│   │   └── scrapedSite.js      # HTML rewriter
│   └── scraped_pages/          # Static HTML from cal.com
│
├── backend/
│   └── app/
│       ├── main.py             # FastAPI entry point
│       ├── database.py         # DB connection & init
│       ├── models.py           # SQLAlchemy models
│       └── routes/             # API route handlers
│
├── scraper.py                  # Cal.com page scraper
└── render.yaml                 # Render.com config
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- A Neon PostgreSQL database (or local PostgreSQL)

### 1. Clone the Repository

```bash
git clone https://github.com/Kushagra-Kataria/Cal.com.git
cd Cal.com
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
echo "DATABASE_URL=postgresql+asyncpg://user:password@host/dbname" > .env

# Start the server
uvicorn app.main:app --reload
# → http://localhost:8000
# → Health check: http://localhost:8000/api/health
```

### 3. Frontend Setup

```bash
cd frontend

npm install

# Optional: set your backend URL
echo "NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com" > .env.local

npm run dev
# → http://localhost:3000
```

---

## Environment Variables

**Frontend** (`.env.local`)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

**Backend** (`.env`)
```env
DATABASE_URL=postgresql+asyncpg://username:password@host:port/database
```

---

## Key Features

### Frontend
- **Scraped Pages Viewer** — Renders static Cal.com HTML with dynamic link rewriting via Cheerio
- **Smart Navigation** — "Get Started" and "Sign in" both route to `/dashboard/event-types`
- **Dashboard** — Full event type management interface
- **Meeting Scheduler** — Schedule and manage meetings
- **Auth Pages** — Login and signup interfaces

### Backend
- **Event Types API** — Full CRUD operations
- **Async PostgreSQL** — Non-blocking DB access via asyncpg + SQLAlchemy
- **CORS Support** — Configured for frontend cross-origin requests
- **Health Check** — `GET /api/health` endpoint for monitoring

---

## Navigation Flow

```
/ (Home)
└── Get Started / Sign In
    └── /dashboard/event-types
        ├── /login
        ├── /signup
        └── /meeting
```

---

## Implementation Notes

### HTML Rewriting (`lib/scrapedSite.js`)
Intercepts and rewrites all Cal.com internal links to local routes. Injects scripts to handle "Get Started" / "Sign in" click events. Preserves external asset URLs pointing back to cal.com.

### API Client (`lib/apiClient.js`)
Communicates with the FastAPI backend. Handles event management operations and is extensible for auth flows.

### Database Models (`backend/app/models.py`)
Defines event types and associated scheduling metadata using SQLAlchemy ORM with async support.

---

## Deployment

### Frontend — Vercel (recommended)
```bash
cd frontend
npm run build
# Deploy via Vercel CLI or GitHub integration
```

### Backend — Render.com
Pre-configured via `render.yaml`. Set `DATABASE_URL` in the Render dashboard environment variables.

---

## Development Commands

```bash
# Frontend
npm run dev       # Development server
npm run build     # Production build
npm start         # Start production server

# Backend
uvicorn app.main:app --reload            # Development (hot reload)
uvicorn app.main:app --host 0.0.0.0     # Production
```

---

## Known Limitations

- No persistent user authentication (demo only)
- Scraped pages are static snapshots — not auto-updated
- CORS limited to `localhost` during local development
- Demo data only — no real scheduling integration

---

## Author

**Kushagra Kataria** · [GitHub](https://github.com/Kushagra-Kataria/Cal.com)

---

*This project is a demonstration/educational clone of Cal.com.*
