# Tech Stack & Dependencies

This document provides a full breakdown of every technology, library, and tool used in PayTracker.

---

## Architecture Overview

PayTracker is a **pnpm monorepo** with three runtime packages and two shared libraries:

| Package | Role |
|---|---|
| `artifacts/payment-tracker` | React + Vite single-page frontend |
| `artifacts/api-server` | Express 5 REST API backend |
| `lib/db` | Drizzle ORM schema, migrations, and DB client |
| `lib/api-zod` | Zod validation schemas (generated from OpenAPI spec) |
| `lib/api-client-react` | Type-safe React Query hooks (generated via Orval) |

---

## Runtime Stack

### Frontend — `artifacts/payment-tracker`

| Technology | Version | Purpose |
|---|---|---|
| [React](https://react.dev/) | 19.1.0 | UI framework |
| [Vite](https://vitejs.dev/) | ^7.3.0 | Build tool and dev server |
| [TypeScript](https://www.typescriptlang.org/) | ~5.9.2 | Static typing |
| [Tailwind CSS](https://tailwindcss.com/) | ^4.1.14 | Utility-first CSS framework |
| [shadcn/ui](https://ui.shadcn.com/) | — | Accessible component primitives (built on Radix UI) |
| [Radix UI](https://www.radix-ui.com/) | various | Headless accessible UI primitives |
| [Recharts](https://recharts.org/) | ^2.15.4 | SVG-based charting library |
| [React Query (TanStack)](https://tanstack.com/query) | ^5.90.21 | Server state management and data fetching |
| [React Hook Form](https://react-hook-form.com/) | ^7.71.2 | Performant form state management |
| [Zod](https://zod.dev/) | 3.25.76 | Schema validation for form inputs |
| [@hookform/resolvers](https://github.com/react-hook-form/resolvers) | ^3.10.0 | Connects Zod schemas to React Hook Form |
| [Wouter](https://github.com/molefrog/wouter) | ^3.3.5 | Lightweight client-side routing |
| [date-fns](https://date-fns.org/) | ^3.6.0 | Date formatting and manipulation |
| [xlsx (SheetJS)](https://sheetjs.com/) | ^0.18.5 | Excel file generation for payment export |
| [Framer Motion](https://www.framer.com/motion/) | 12.35.1 | Animation library |
| [Lucide React](https://lucide.dev/) | ^0.545.0 | Icon set |
| [Sonner](https://sonner.emilkowal.ski/) | ^2.0.7 | Toast notifications |
| [next-themes](https://github.com/pacocoursey/next-themes) | ^0.4.6 | Dark/light theme management |
| [clsx](https://github.com/lukeed/clsx) | 2.1.1 | Conditional className utility |
| [tailwind-merge](https://github.com/dcastil/tailwind-merge) | 3.5.0 | Merges Tailwind classes without conflicts |
| [class-variance-authority](https://cva.style/) | ^0.7.1 | Variant-based component styling |

### Backend — `artifacts/api-server`

| Technology | Version | Purpose |
|---|---|---|
| [Node.js](https://nodejs.org/) | v18+ | JavaScript runtime |
| [Express 5](https://expressjs.com/) | ^5 | HTTP server framework |
| [TypeScript](https://www.typescriptlang.org/) | ~5.9.2 | Static typing |
| [tsx](https://github.com/privatenumber/tsx) | ^4.21.0 | TypeScript execution for Node (dev server) |
| [openid-client](https://github.com/panva/openid-client) | ^6.8.2 | OpenID Connect client for Replit Auth |
| [cors](https://github.com/expressjs/cors) | ^2 | Cross-Origin Resource Sharing middleware |
| [cookie-parser](https://github.com/expressjs/cookie-parser) | ^1.4.7 | Cookie parsing middleware |
| [Drizzle ORM](https://orm.drizzle.team/) | ^0.45.1 | Type-safe SQL query builder |
| [Zod](https://zod.dev/) | 3.25.76 | Runtime request body validation |

### Database — `lib/db`

| Technology | Version | Purpose |
|---|---|---|
| [PostgreSQL](https://www.postgresql.org/) | — | Relational database |
| [Drizzle ORM](https://orm.drizzle.team/) | ^0.45.1 | Schema definition, query builder |
| [drizzle-zod](https://orm.drizzle.team/docs/zod) | ^0.8.3 | Auto-generates Zod schemas from Drizzle tables |
| [drizzle-kit](https://orm.drizzle.team/kit-docs/overview) | ^0.31.9 | Schema push / migrations CLI |
| [pg](https://node-postgres.com/) | ^8.20.0 | PostgreSQL Node.js driver |

---

## Database Schema

### `users` table
Managed by Replit Auth. Stores authenticated user profiles.

| Column | Type | Notes |
|---|---|---|
| `id` | `varchar` (UUID) | Primary key |
| `email` | `varchar` | Unique |
| `first_name` | `varchar` | |
| `last_name` | `varchar` | |
| `profile_image_url` | `varchar` | |
| `created_at` | `timestamp` | |
| `updated_at` | `timestamp` | Auto-updated |

### `sessions` table
Stores server-side session data for Replit Auth.

| Column | Type | Notes |
|---|---|---|
| `sid` | `varchar` | Primary key |
| `sess` | `jsonb` | Session payload |
| `expire` | `timestamp` | Expiry for cleanup |

### `clients` table
Each client is scoped to a specific user.

| Column | Type | Notes |
|---|---|---|
| `id` | `serial` | Primary key |
| `user_id` | `text` | Foreign key to `users.id` |
| `name` | `text` | Required |
| `email` | `text` | Optional |
| `created_at` | `timestamp` | |

### `payments` table
Each payment belongs to a user and a client.

| Column | Type | Notes |
|---|---|---|
| `id` | `serial` | Primary key |
| `user_id` | `text` | Foreign key to `users.id` |
| `client_id` | `integer` | Foreign key to `clients.id` |
| `amount` | `numeric(12,2)` | Dollar amount |
| `payment_date` | `date` | `YYYY-MM-DD` |
| `description` | `text` | Optional |
| `payment_method` | `text` | Enum: `cash`, `check`, `bank_transfer`, `credit_card`, `paypal`, `venmo`, `zelle`, `other` |
| `invoice_number` | `text` | Optional |
| `created_at` | `timestamp` | |

---

## Code Generation

### OpenAPI → Zod (`lib/api-zod`)
The API contract is defined in `lib/api-spec/openapi.yaml` and compiled into Zod schemas using a custom script.

### OpenAPI → React Query hooks (`lib/api-client-react`)
[Orval](https://orval.dev/) reads the same OpenAPI spec and generates fully typed React Query hooks, keeping the frontend and API in sync automatically.

---

## Authentication

Authentication is handled via **Replit Auth**, an OpenID Connect (OIDC) provider.

- The backend uses `openid-client` to verify tokens and manage sessions (stored server-side in PostgreSQL).
- The frontend uses a custom `useAuth()` hook from `@workspace/replit-auth-web` to read session state.
- All API routes are protected by `authMiddleware`, which validates the session on every request.
- Every database query is filtered by `user_id`, ensuring complete data isolation between accounts.

---

## Monorepo Tooling

| Tool | Version | Purpose |
|---|---|---|
| [pnpm](https://pnpm.io/) | v9+ | Package manager with workspace support |
| [TypeScript](https://www.typescriptlang.org/) | ~5.9.2 | Project-wide static typing |
| [Prettier](https://prettier.io/) | ^3.8.1 | Code formatting |
| [esbuild](https://esbuild.github.io/) | ^0.27.3 | API server bundler for production |

---

## Replit-Specific Plugins (Development Only)

| Plugin | Purpose |
|---|---|
| `@replit/vite-plugin-cartographer` | Source map explorer integration |
| `@replit/vite-plugin-dev-banner` | Displays dev info banner |
| `@replit/vite-plugin-runtime-error-modal` | Overlay for runtime errors in dev |
