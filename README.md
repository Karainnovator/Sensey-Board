# Sensey Board

Modern project management tool built with Next.js 15 and tRPC.

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS, shadcn/ui
- **Backend**: tRPC v11, Prisma ORM
- **Database**: PostgreSQL (Neon)
- **Auth**: NextAuth.js + Azure AD
- **i18n**: next-intl (EN, NL, TR)

## Project Structure

```
sensey-board/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Internationalized pages
│   │   ├── (auth)/        # Login pages
│   │   └── (dashboard)/   # Protected dashboard
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui base components
│   ├── board/            # Board components
│   ├── ticket/           # Ticket components
│   └── sprint/           # Sprint components
├── server/               # Backend
│   └── api/routers/      # tRPC API endpoints
├── prisma/               # Database schema
├── lib/                  # Utilities
├── hooks/                # React hooks
└── messages/             # i18n translations
```

## Getting Started

### Prerequisites

- Node.js 20+ or Bun
- PostgreSQL (local or Neon)

### Installation

```bash
# Install dependencies
bun install

# Setup environment
cp .env.example .env
# Edit .env with your database URL

# Push database schema
bunx prisma db push

# Start dev server
bun dev
```

Open [http://localhost:3000](http://localhost:3000)

### Development Login

In development mode, use:

- Email: `demo@sensey.dev`
- Password: `demo123`

## Scripts

```bash
bun dev          # Start development server
bun run build    # Production build
bun run lint     # Run linter
bun test         # Run tests
```

## Deployment

### Vercel (Recommended)

1. Create PostgreSQL database on [Neon](https://neon.tech)
2. Connect repo to Vercel
3. Add environment variables:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `AZURE_AD_CLIENT_ID`
   - `AZURE_AD_CLIENT_SECRET`
   - `AZURE_AD_TENANT_ID`
4. Deploy

### Docker

```bash
docker build -t sensey-board .
docker run -p 3000:3000 --env-file .env sensey-board
```

## Environment Variables

See `.env.example` for local development and `.env.production.example` for production.

## License

Private - All rights reserved
