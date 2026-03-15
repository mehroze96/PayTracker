# PayTracker

A full-stack contractor payment tracking application built for tax purposes. Track income from clients, visualize earnings with an analytics dashboard, and export payment records to Excel — all behind a secure, per-user login.

---

## Features

- **Secure Authentication** — Login-gated access using Replit Auth (OpenID Connect). Every user's data is completely isolated from other users.
- **Payment Management** — Record payments with date, amount, client, payment method, invoice number, and description. Full create, edit, and delete support.
- **Client Management** — Maintain a personal client list. Payments are linked to clients.
- **Analytics Dashboard** — Visual charts for income by month, top clients, and payment method breakdown — with year, month, and client filters.
- **Excel Export** — Download filtered payment records as a formatted `.xlsx` spreadsheet, ready for tax filing or accounting.
- **Data Privacy** — Each account is fully isolated. No user can see another user's clients or payments.

---

## Project Structure

```
PayTracker/
├── artifacts/
│   ├── payment-tracker/        # React + Vite frontend
│   └── api-server/             # Express 5 REST API
├── lib/
│   ├── db/                     # Drizzle ORM schema + DB client
│   ├── api-spec/               # OpenAPI 3.0 specification
│   ├── api-zod/                # Zod schemas generated from OpenAPI spec
│   └── api-client-react/       # React Query API client (generated via Orval)
└── pnpm-workspace.yaml
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [pnpm](https://pnpm.io/) v9+
- A PostgreSQL database (connection string in `DATABASE_URL`)

### Installation

```bash
pnpm install
```

### Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Secret used to sign session cookies |
| `REPLIT_DOMAINS` | Allowed CORS origins (set automatically on Replit) |
| `REPL_ID` | Replit project ID (used by Replit Auth) |

### Database Setup

Push the schema to your database:

```bash
pnpm --filter @workspace/db run push
```

### Running Locally

Start the API server:

```bash
pnpm --filter @workspace/api-server run dev
```

Start the frontend:

```bash
pnpm --filter @workspace/payment-tracker run dev
```

---

## API Overview

All API routes require authentication. Requests without a valid session return `401 Unauthorized`.

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/clients` | List all clients for the logged-in user |
| `POST` | `/api/clients` | Create a new client |
| `DELETE` | `/api/clients/:id` | Delete a client |
| `GET` | `/api/payments` | List payments (filterable by year, month, client) |
| `POST` | `/api/payments` | Record a new payment |
| `GET` | `/api/payments/:id` | Get a single payment |
| `PUT` | `/api/payments/:id` | Update a payment |
| `DELETE` | `/api/payments/:id` | Delete a payment |
| `GET` | `/api/payments/summary` | Aggregated totals by month, client, and method |

---

## Payment Methods

Supported values: `cash`, `check`, `bank_transfer`, `credit_card`, `paypal`, `venmo`, `zelle`, `other`

---

## License

MIT
