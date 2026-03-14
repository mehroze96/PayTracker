# Workspace

## Overview

Payment Tracker — a full-stack app for independent contractors to track client payments for tax purposes.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, React Query, Recharts, react-hook-form

## Features

- Dashboard with total income (year, month), active clients count, income-by-month chart
- Payments list with filtering by client/year/month, add/edit/delete payments
- Client management (add/delete clients)
- Payment methods: cash, check, bank transfer, credit card, PayPal, Venmo, Zelle, other
- Summary totals by month, by client, by payment method

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── payment-tracker/    # React + Vite frontend (previewPath: /)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## DB Schema

- `clients` — id, name, email (optional), created_at
- `payments` — id, client_id, amount, payment_date, description, payment_method, invoice_number, created_at

## API Routes (all under /api)

- `GET/POST /payments` — list / create payments
- `GET/PUT/DELETE /payments/:id` — read / update / delete payment
- `GET /payments/summary` — aggregated totals (by month, client, method)
- `GET/POST /clients` — list / create clients
- `DELETE /clients/:id` — delete client

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
