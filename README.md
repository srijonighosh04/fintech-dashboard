# AstraBank - Premium Commercial Fintech SaaS Platform

AstraBank is a production-grade, highly secure commercial banking and investment analytics application built using Next.js, PostgreSQL, and Prisma.

---

## 💻 Tech Stack & Integrations

- **Core Framework**: Next.js (App Router, Server Actions, Middleware/Proxy)
- **Identity & Sessions**: Appwrite Client SDK & Node Admin Management
- **Database & ORM**: PostgreSQL, Prisma ORM
- **Financial Integrations**: Plaid Sandbox Link, Dwolla ACH Transaction Simulator
- **Artificial Intelligence**: Google Gemini 1.5 Flash (OCR receipt scanning, budget analyzers, chat widgets)
- **Security Protections**: Rate Limiting, XSS inputs strip filtering, CSRF matches, Helmet Strict HTTP Headers, central audit trace logs
- **DevOps**: Docker Multi-stage standalone build pipelines, GitHub Actions workflows, Playwright E2E and native Node unit test suites

---

## 🗺️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Browser Layer"]
        User(["User Browser"])
    end

    subgraph Server ["Next.js Production Standalone Container"]
        Middleware["Security Middleware (CSP, CSRF, Rate Limiting)"]
        Pages["App Router Pages"]
        Actions["Secure Server Actions"]
        Cache["Local Memory Cache"]
    end

    subgraph Database ["Database Layer"]
        Postgres[(PostgreSQL Server)]
    end

    subgraph External ["Financial Gateways"]
        Plaid["Plaid API"]
        Dwolla["Dwolla API"]
        Appwrite["Appwrite Auth"]
        Gemini["Gemini AI API"]
    end

    User --> Middleware
    Middleware --> Pages
    Pages --> Actions
    Actions --> Cache
    Actions --> Postgres
    Actions --> Plaid
    Actions --> Dwolla
    Actions --> Appwrite
    Actions --> Gemini
```

---

## 📁 Repository Folder Structure

```text
├── .github/workflows/       # GitHub Actions CI/CD pipeline
├── prisma/                  # Database models schemas and seed scripts
├── public/                  # Static assets, manifests, and Service Workers
├── src/
│   ├── app/                 # Next.js App routes pages and API handlers
│   │   ├── api/health/      # System health API check route
│   │   └── (root)/          # Authentication guarded dashboard screens
│   ├── components/          # Reusable shared UI nodes
│   ├── constants/           # Static routes mapping and navigation items
│   ├── features/            # Modular feature domains
│   │   ├── accounts/        # Plaid link and account grid widgets
│   │   ├── auth/            # Signin / Signup forms and Appwrite hooks
│   │   ├── automation/      # Bill reminders and OCR receipt scanners
│   │   ├── dashboard/       # Metrics overview and Recharts charts
│   │   ├── fraud/           # Risk checking engine, cases alerts banner
│   │   ├── security/        # settings logs and strength calculators
│   │   └── transfers/       # internal/external money transfer forms
│   ├── lib/                 # Core server connectors (Prisma, Dwolla, Redis)
│   └── utils/               # Sanitizers, format adapters, and validators
├── tests/                   # Playwright E2E automation tests
├── Dockerfile               # Standalone multi-stage builder script
├── docker-compose.yml       # App, Postgres, Redis dependencies composer
└── playwright.config.ts     # Playwright E2E browser settings
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose (optional)

### Environment Configurations
Create a `.env.local` file at the root:
```env
# Database
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/astrabank"

# Appwrite Configurations
NEXT_PUBLIC_APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1"
NEXT_PUBLIC_APPWRITE_PROJECT="your-project-id"
APPWRITE_KEY="your-api-key"

# Plaid & Dwolla Keys
PLAID_CLIENT_ID="plaid-client-id"
PLAID_SECRET="plaid-secret"

# LLM Keys
GEMINI_API_KEY="gemini-api-key"
```

### Local Dev Build
1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Database Schema Sync**:
   ```bash
   npx prisma generate
   ```
3. **Boot Dev Server**:
   ```bash
   npm run dev
   ```

---

## 🛡️ API Telemetry Documentation

### Health Probe
- **Endpoint**: `GET /api/health`
- **Response**: `200 OK` (Healthy) or `503 Service Unavailable`
- **Output Sample**:
```json
{
  "status": "healthy",
  "timestamp": "2026-07-30T03:26:15Z",
  "uptime": "152.4s",
  "services": {
    "database": "online",
    "auth": "online"
  },
  "system": {
    "memoryUsed": "24.50 MB",
    "memoryTotal": "48.20 MB"
  }
}
```

---

## 🧪 Testing Run

### Native Unit Tests
Tests security input and object HTML strip sanitizers:
```bash
npm test
```

### End-to-End Tests
Tests redirection flow routes:
```bash
npx playwright test
```
