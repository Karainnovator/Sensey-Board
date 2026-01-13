# 🌸 Sensey Board

Modern project management tool inspired by Notion's simplicity and Jira's functionality. Built with Next.js 16, Bun, and shadcn/ui.

## 🚀 Tech Stack

- **Runtime:** Bun 1.1+
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript 5.7+
- **Styling:** Tailwind CSS 4.0, shadcn/ui
- **Database:** PostgreSQL 16, Prisma ORM 6
- **Auth:** NextAuth.js v5, Keycloak 24+
- **API:** tRPC v11
- **State Management:** Zustand, TanStack Query v5
- **Drag & Drop:** @dnd-kit
- **Animations:** Framer Motion

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Bun](https://bun.sh/) v1.1 or higher
- [Node.js](https://nodejs.org/) v20 or higher (for compatibility)
- [PostgreSQL](https://www.postgresql.org/) v16 or higher
- [Keycloak](https://www.keycloak.org/) v24 or higher (for authentication)

## 🛠️ Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd sensey-board
```

### 2. Install dependencies

```bash
bun install
```

### 3. Setup environment variables

Copy the example environment file and update with your values:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

- **DATABASE_URL:** Your PostgreSQL connection string
- **NEXTAUTH_SECRET:** Generate with `openssl rand -base64 32`
- **KEYCLOAK\_\*** variables:\*\* Your Keycloak configuration

### 4. Setup the database

```bash
# Generate Prisma client
bunx prisma generate

# Run migrations
bunx prisma migrate dev

# Seed the database (optional)
bunx prisma db seed
```

### 5. Start the development server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
sensey-board/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── board/            # Board-related components
│   ├── ticket/           # Ticket-related components
│   ├── sprint/           # Sprint-related components
│   └── shared/           # Shared components
├── server/               # Server-side code
│   ├── api/             # tRPC routers
│   ├── db/              # Database utilities
│   └── auth/            # Auth configuration
├── lib/                 # Utility functions
├── hooks/               # Custom React hooks
├── stores/              # Zustand stores
├── types/               # TypeScript types
├── prisma/              # Prisma schema and migrations
└── tests/               # Test files
```

## 🧪 Available Scripts

```bash
# Development
bun dev              # Start development server with Turbopack

# Build
bun run build        # Build for production
bun start            # Start production server

# Code Quality
bun run lint         # Run ESLint
bun run format       # Format code with Prettier
bun run format:check # Check code formatting
bun run type-check   # Run TypeScript type checking

# Database
bunx prisma studio   # Open Prisma Studio
bunx prisma migrate dev    # Create and apply migration
bunx prisma db push        # Push schema changes
bunx prisma generate       # Generate Prisma client
```

## 🎨 Design System

### Colors

- **Primary (Sakura Pink):** `#FFB7C5`
- **Sakura variants:** 50, 100, 200...900
- **Neutrals:** Black, white, grays
- **Semantic:** Success, error, warning, info

### Spacing Scale (4px base)

- `xs: 4px`, `sm: 8px`, `md: 12px`, `lg: 16px`
- `xl: 24px`, `2xl: 32px`, `3xl: 48px`

### Animation Timings

- Micro-interactions: 150ms
- Standard transitions: 200ms
- Complex animations: 300ms
- Page transitions: 400ms

## 🔒 Authentication

The application uses NextAuth.js v5 with Keycloak for authentication:

1. Configure Keycloak realm and client
2. Set up environment variables
3. Users can login via Keycloak SSO
4. Role-based access control (RBAC)

## 🧑‍💻 Development Guidelines

### Code Style

- Use TypeScript strict mode (no `any` types)
- Follow ESLint and Prettier configurations
- Write self-documenting code in English
- Keep components under 200 lines
- Use custom hooks for reusable logic

### Git Workflow

- Husky pre-commit hooks run automatically
- Linting and formatting applied on commit
- Follow conventional commit messages

### Component Best Practices

- Use Server Components by default
- Client Components only when needed
- Proper error boundaries
- Loading states for async operations
- Accessibility (ARIA labels, keyboard nav)

## 📦 Adding shadcn/ui Components

```bash
bunx shadcn@latest add <component-name>
```

Example:

```bash
bunx shadcn@latest add button
bunx shadcn@latest add dialog
```

## 🐛 Troubleshooting

### Database connection issues

Ensure PostgreSQL is running and DATABASE_URL is correct:

```bash
psql -U postgres -c "SELECT version();"
```

### Prisma issues

Reset database if needed (⚠️ destroys data):

```bash
bunx prisma migrate reset
```

### Port already in use

Kill process using port 3000:

```bash
lsof -ti:3000 | xargs kill
```

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Bun Documentation](https://bun.sh/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Prisma](https://www.prisma.io/docs)
- [NextAuth.js](https://next-auth.js.org)

## 🤝 Contributing

This project follows a multi-agent development approach with QA-driven workflow. See `agent-orchestration.md` for details.

## 📄 License

[Your License Here]

---

Built with ❤️ using Next.js 16 and Bun
