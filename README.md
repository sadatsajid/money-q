# MoneyQ - AI Expense Tracker

Smart personal finance management system designed for Bangladesh, with AI-powered insights and automated expense tracking.

## Features

- 💰 Income & expense tracking
- 🔄 Automated recurring expenses
- 🎯 Savings goals (Trip Fund, Emergency, Investment)
- 🤖 AI-powered categorization & insights
- 📊 Monthly summaries & analytics
- 💳 Multiple payment methods
- 🌏 Multi-currency support (BDT, USD, EUR, GBP, MYR, SGD)

## Tech Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth
- **AI:** OpenAI GPT-4o-mini
- **State:** TanStack Query
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm
- PostgreSQL database (Supabase account)
- OpenAI API key

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd mon-iq
\`\`\`

2. Install dependencies:
\`\`\`bash
pnpm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local` with your credentials:
- Supabase URL and keys
- Database connection string
- OpenAI API key

4. Set up the database:
\`\`\`bash
pnpm db:push
pnpm db:seed
\`\`\`

5. Run the development server:
\`\`\`bash
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The schema includes:
- Users (with Supabase auth integration)
- Expenses (with soft delete)
- Income entries
- Recurring expenses
- Payment methods
- Savings buckets & distributions
- Budgets
- Categories (predefined)
- Exchange rates
- Monthly insights

## Project Structure

\`\`\`
/app              # Next.js App Router
  /(auth)         # Authentication pages
  /(dashboard)    # Dashboard & main app
  /api            # API routes
/lib              # Core utilities
  /money.ts       # Decimal.js money calculations
  /prisma.ts      # Prisma client
  /utils.ts       # Helper functions
/components       # React components
  /ui             # shadcn/ui components
  /dashboard      # Dashboard-specific
  /forms          # Form components
  /charts         # Chart components
/prisma           # Database schema & migrations
/constants        # App constants
/types            # TypeScript types
/hooks            # Custom React hooks
/__tests__        # Test files
\`\`\`

## Key Concepts

### Money Calculations
All financial calculations use `decimal.js` for precision. The `Money` class in `lib/money.ts` ensures deterministic math.

### Recurring Expenses
Auto-added via Vercel Cron job that runs daily. Uses `lastProcessedMonth` for idempotency.

### Savings Distribution
Net savings = Income - Expenses, then distributed to buckets either manually or via auto-distribution rules.

### AI Integration
- **Categorization:** On-demand suggestion for uncategorized expenses
- **Monthly Insights:** Generated markdown insights stored in DB

## Development

### Database Commands

\`\`\`bash
pnpm db:generate   # Generate Prisma Client
pnpm db:push       # Push schema to database
pnpm db:migrate    # Create migration
pnpm db:studio     # Open Prisma Studio
pnpm db:seed       # Seed categories
\`\`\`

### Testing

\`\`\`bash
pnpm test          # Run tests
pnpm test:watch    # Run tests in watch mode
\`\`\`

### Code Quality

\`\`\`bash
pnpm lint          # Run ESLint
pnpm format        # Format with Prettier
\`\`\`

## Roadmap

### MVP (Current)
- ✅ Core tracking (income, expenses)
- ✅ Recurring expenses
- ✅ Savings buckets
- ✅ Basic AI insights
- 🚧 Authentication
- 🚧 Dashboard UI

### V2
- Budgets & alerts
- EMI progress tracking
- AI chat interface
- CSV export

### V3
- Family sharing
- Receipt uploads
- PDF reports
- Advanced analytics

## License

Private - All rights reserved

## Support

For questions or issues, contact the development team.

