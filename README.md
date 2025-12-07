# Magnifi UI

A modern Next.js 16 application with authentication, database, and API integrations.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Runtime**: Bun
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Better Auth (email/password, Google, GitHub)
- **API**: ElysiaJS + Eden client (type-safe)
- **UI**: shadcn/ui + Tailwind CSS 4
- **Code Quality**: ESLint, Prettier, Husky

## Getting Started

### Prerequisites

- Bun
- Docker (for PostgreSQL)

### Setup

1. Clone and install dependencies:

```bash
bun install
```

2. Configure environment variables:

```bash
cp .env.example .env.local
```

Required variables:

- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Auth secret key
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth (optional)
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` - GitHub OAuth (optional)

3. Start the database:

```bash
bun run db:start
```

4. Run migrations:

```bash
bun run db:migrate
```

5. Start the dev server:

```bash
bun run dev
```

## Scripts

| Command             | Description         |
| ------------------- | ------------------- |
| `bun run dev`       | Start dev server    |
| `bun run build`     | Production build    |
| `bun run lint`      | Run ESLint          |
| `bun run db:start`  | Start PostgreSQL    |
| `bun run db:stop`   | Stop PostgreSQL     |
| `bun run db:push`   | Push schema to DB   |
| `bun run db:studio` | Open Drizzle Studio |

## Project Structure

```
app/
├── (auth)/          # Login/Signup pages
├── api/             # ElysiaJS API routes
├── dashboard/       # Protected dashboard
lib/
├── auth.ts          # Better Auth config
├── db.ts            # Drizzle database
├── eden.ts          # Eden API client
├── schema.ts        # Database schema
components/
├── ui/              # shadcn/ui components
├── dashboard/       # Dashboard components
```

## API Usage

The API uses ElysiaJS with Eden for end-to-end type safety:

```typescript
import { api } from "@/lib/eden";

const { data } = await api.api.hello.get();
```
