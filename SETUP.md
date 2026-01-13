# MoneyQ - Setup Guide

## 🎉 Congratulations! Your MVP is Ready!

MoneyQ is a complete AI-powered expense tracking application built with Next.js 15, TypeScript, Prisma, and OpenAI.

## ✅ What's Built

### Core Features
- ✅ **Authentication** - Full Supabase auth (login, signup, password reset)
- ✅ **Dashboard** - Beautiful overview with charts and monthly summary
- ✅ **Expense Tracking** - Add, edit, delete, filter expenses
- ✅ **Income Tracking** - Track multiple income sources
- ✅ **Payment Methods** - Manage payment methods (Cash, Cards, Digital Wallets)
- ✅ **Recurring Expenses** - Auto-add subscriptions, EMI, utilities
- ✅ **Savings Buckets** - Goal-based savings (Trip, Emergency, Investment)
- ✅ **Savings Distribution** - Manual & auto-distribution with percentages
- ✅ **AI Categorization** - Smart expense categorization
- ✅ **AI Insights** - Monthly financial analysis & recommendations
- ✅ **Monthly Summary** - Complete financial overview with charts
- ✅ **Categories** - 13 predefined expense categories
- ✅ **Multi-currency** - BDT primary, with USD/EUR/GBP/MYR/SGD support

### Technical Features
- ✅ Deterministic money calculations with `decimal.js`
- ✅ Complete test suite for money operations
- ✅ Soft delete for audit trail
- ✅ Row Level Security (RLS) ready
- ✅ Vercel Cron for recurring expenses
- ✅ Server-side calculations for accuracy
- ✅ Responsive UI with Tailwind CSS

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

Create `.env.local` in the project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database (from Supabase > Project Settings > Database)
# Option 1: Direct connection (requires IP allowlist)
# DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres

# Option 2: Connection pooler (RECOMMENDED - no IP allowlist needed)
# Use port 6543 and add ?pgbouncer=true
DATABASE_URL=postgresql://postgres:[password]@[host]:6543/postgres?pgbouncer=true

# OpenAI
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5-mini

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Exchange Rate API (optional - defaults to exchangerate-api.com)
EXCHANGE_RATE_API_URL=https://api.exchangerate-api.com/v4/latest/USD

# Cron Secret (for production)
CRON_SECRET=your_random_secret_string
```

### 3. Set Up Supabase

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key to `.env.local`
4. Get your database connection string from Settings > Database

### 4. Initialize Database

```bash
# Generate Prisma Client
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed categories
pnpm db:seed
```

### 5. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📦 Project Structure

```
mon-iq/
├── app/
│   ├── (auth)/                    # Auth pages
│   │   ├── login/
│   │   ├── signup/
│   │   └── reset-password/
│   ├── (dashboard)/               # Main app
│   │   ├── dashboard/             # Overview with charts
│   │   ├── transactions/          # Expense tracking
│   │   ├── income/                # Income management
│   │   ├── recurring/             # Recurring expenses
│   │   ├── savings/               # Savings buckets
│   │   ├── insights/              # AI insights
│   │   └── settings/              # Payment methods & profile
│   └── api/                       # API routes
│       ├── users/
│       ├── expenses/
│       ├── income/
│       ├── recurring/
│       ├── savings/
│       ├── summary/
│       ├── ai/
│       │   ├── categorize/
│       │   └── insights/
│       └── cron/
│           └── process-recurring/
├── components/
│   ├── ui/                        # shadcn/ui components
│   └── dashboard/                 # Sidebar, Header
├── lib/
│   ├── money.ts                   # Decimal.js calculations
│   ├── prisma.ts                  # Database client
│   ├── utils.ts                   # Helper functions
│   └── supabase/                  # Auth helpers
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── seed.ts                    # Category seeding
├── constants/                     # App constants
├── types/                         # TypeScript types
└── __tests__/                     # Test files
```

---

## 🧪 Testing

```bash
# Run unit tests (after db:generate)
pnpm test

# Watch mode
pnpm test:watch
```

**Note:** Run `pnpm db:generate` before testing to generate Prisma Client.

---

## 🎨 UI Design

The app follows the beautiful design you provided:
- **Primary Color:** Green (#22c55e)
- **Accent:** Light mint (#d1f4e0)
- **Dark Cards:** Deep green (#14532d)
- **Clean, modern interface** with shadcn/ui components
- **Responsive** design for desktop & mobile

---

## 💰 Money Calculation System

All financial calculations use the `Money` class (`lib/money.ts`):

```typescript
import { Money } from "@/lib/money";

// Create money instance
const amount = new Money(1000);

// Perform calculations
const total = amount.add(new Money(500));
const percentage = amount.percentage(20); // 20% of 1000

// Format for display
formatMoney(total, "BDT"); // ৳1,500.00
```

**Key Features:**
- Deterministic calculations with `decimal.js`
- No floating-point errors
- Server-side calculations for accuracy
- Full test coverage

---

## 🤖 AI Features

### Categorization
- On-demand expense categorization
- Uses GPT-4o-mini for fast, accurate results
- Confidence scores for suggestions

### Monthly Insights
- AI-generated financial analysis
- Bangladesh-specific recommendations
- Markdown-formatted for readability
- Stored in database for history

**Cost Optimization:**
- Uses `gpt-5-mini` (cost-effective)
- Insights cached in database
- Rate limiting recommended for production

---

## 🔄 Recurring Expenses

Automatic recurring expense processing via Vercel Cron:

**Setup in Production:**
1. Deploy to Vercel
2. Add `CRON_SECRET` environment variable
3. Cron runs daily at 2 AM (configured in `vercel.json`)
4. Processes all active recurring expenses
5. Updates `lastProcessedMonth` for idempotency

**Manual Trigger:**
```bash
curl -X GET http://localhost:3000/api/cron/process-recurring \
  -H "Authorization: Bearer your_cron_secret"
```

---

## 🤖 Auto Monthly Insights

Automatic monthly insights generation via Vercel Cron:

**Setup in Production:**
1. Deploy to Vercel
2. Add `CRON_SECRET` environment variable (same as recurring expenses)
3. Cron runs on the 1st of each month at 3 AM (configured in `vercel.json`)
4. Generates insights for the previous month for all users
5. Skips users who already have insights for that month (idempotent)

**Manual Trigger:**
```bash
curl -X GET http://localhost:3000/api/cron/generate-insights \
  -H "Authorization: Bearer your_cron_secret"
```

**Features:**
- Generates insights for the previous month automatically
- Processes all users in the system
- Handles errors gracefully (continues with other users if one fails)
- Returns summary with success/skip/error counts
- Idempotent (won't regenerate if insight already exists)

---

## 💾 Database Schema

### Core Tables
- `users` - User profiles
- `categories` - 13 predefined categories
- `payment_methods` - Cash, cards, wallets
- `expenses` - Transaction records
- `incomes` - Income entries
- `recurring_expenses` - Subscription templates
- `savings_buckets` - Goal-based savings
- `savings_distributions` - Monthly distributions
- `budgets` - Category budgets (future)
- `exchange_rates` - Currency conversion
- `monthly_insights` - AI-generated insights

### Key Features
- Soft deletes for expenses/payment methods
- Row-level security ready
- Optimized indexes for queries
- `lastProcessedMonth` for cron idempotency

---

## 🔐 Security

### Authentication
- Supabase Auth with email/password
- Session management with secure cookies
- Password reset flow
- Protected routes via middleware

### Database
- Row Level Security (RLS) policies
- User ownership verification on all operations
- Soft deletes for audit trail
- No cascading deletes on user data

### API
- Authentication check on every endpoint
- User ownership verification
- Rate limiting recommended for AI endpoints

---

## 📊 Features by Page

### Dashboard
- Total income/expenses/savings cards
- Savings rate calculation
- Category breakdown chart (Recharts)
- Fixed vs variable expenses
- Top 5 spending categories with progress bars

### Transactions
- Add/edit/delete expenses
- Multi-currency support
- Category & payment method selection
- Month filter
- Search by merchant/category
- Recurring expense indicator

### Income
- Multiple income sources (Salary, Freelance, Bonus, etc.)
- Month-wise view
- Edit/delete entries

### Recurring
- Subscription management
- EMI/Loans tracking
- Wife Monthly Expense
- Auto-add toggle
- Shows last 5 transactions per template

### Savings
- 3 default buckets (Trip, Emergency, Investment)
- Custom buckets
- Target amount & date
- Progress tracking
- Manual distribution
- Auto-distribution by percentage
- Distribution history

### Insights
- AI-generated monthly analysis
- Spending patterns
- Savings performance
- Bangladesh-specific recommendations
- Markdown formatted
- Regenerate anytime

### Settings
- Payment method management
- Card last 4 digits
- Digital wallet providers
- Soft delete protection

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Environment Variables:**
Add all `.env.local` variables to Vercel project settings.

**Cron Job:**
Configured in `vercel.json` - runs automatically after deployment.

### Database
- Supabase handles hosting
- No additional setup needed

---

## 🔧 Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm format           # Format with Prettier

# Database
pnpm db:generate      # Generate Prisma Client
pnpm db:push          # Push schema to database
pnpm db:migrate       # Create migration
pnpm db:studio        # Open Prisma Studio
pnpm db:seed          # Seed categories

# Testing
pnpm test             # Run tests
pnpm test:watch       # Watch mode
```

---

## 🎯 MVP Scope (Completed)

✅ User authentication
✅ Income tracking (multiple entries/month)
✅ Daily expense tracking
✅ Payment methods
✅ Categories (13 predefined)
✅ Recurring expenses (subscriptions, EMI, etc.)
✅ Monthly summary & history
✅ Savings buckets (Trip, Emergency, Investment)
✅ Manual & auto savings distribution
✅ Basic AI categorization (on-demand)
✅ Monthly AI insights (on-demand)

---

## 🚦 Post-MVP Features

### V2 (Next Phase)
- [x] Budgets + alerts ✅
- [ ] EMI progress tracking with principal/interest split
- [x] AI chat interface ✅
- [x] CSV export ✅
- [x] Auto monthly insights (scheduled) ✅
- [ ] Exchange rate auto-fetch

### V3 (Future)
- [ ] Family sharing (invite spouse)
- [ ] Receipt uploads
- [ ] PDF reports
- [ ] Advanced anomaly detection
- [ ] Mobile app (React Native)

---

## 🐛 Troubleshooting

### Prisma Client Not Found
```bash
pnpm db:generate
```

### Database Connection Error (P1001)

**Error:** `Can't reach database server at [host]:5432`

**Solutions:**

1. **Use Connection Pooler (Recommended)**
   - Go to Supabase Dashboard → Project Settings → Database
   - Copy the "Connection Pooling" URL (port 6543)
   - Update `DATABASE_URL` in `.env.local`:
     ```bash
     DATABASE_URL=postgresql://postgres:[password]@[host]:6543/postgres?pgbouncer=true
     ```

2. **Add IP to Allowlist (For Direct Connection)**
   - Get your IP: `curl https://api.ipify.org`
   - Go to Supabase Dashboard → Project Settings → Database
   - Add your IP to "Network Restrictions" or "IP Allowlist"
   - Keep using port 5432

3. **Verify Database is Active**
   - Check Supabase project status
   - Free tier databases pause after inactivity - wake it up in dashboard

4. **Check Connection String Format**
   - Ensure password is URL-encoded (special chars like `@` → `%40`)
   - Format: `postgresql://postgres:[password]@[host]:[port]/postgres`

### Tests Failing
```bash
# Generate Prisma Client first
pnpm db:generate
pnpm test
```

### Cron Job Not Running
- Check `CRON_SECRET` is set
- Verify Vercel deployment
- Check Vercel logs for errors

### AI Features Not Working
- Verify `OPENAI_API_KEY` is set
- Check OpenAI account has credits
- Review API logs for rate limits

### Rate Limiting on Signup/Password Reset (429 Error)

**Error:** `over_email_send_rate_limit` - "For security purposes, you can only request this after X seconds"

**Cause:** Supabase rate-limits email sending to prevent abuse (typically 1 email per 60 seconds per IP).

**Solutions:**

1. **Wait for Rate Limit** (Recommended for Production)
   - The app now shows a countdown timer
   - Wait for the specified time before retrying

2. **Disable Email Confirmation (Development Only)**
   - Go to Supabase Dashboard → Authentication → Settings
   - Under "Email Auth", toggle **"Enable email confirmations"** to OFF
   - Users will be automatically confirmed (no email sent)
   - **⚠️ Only use this in development!**

3. **Use Different Email/Network**
   - Try a different email address
   - Use a different network/VPN to change IP

**Note:** Rate limiting is a security feature. In production, users should wait or use password reset if they already have an account.

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Recharts Documentation](https://recharts.org)
- [OpenAI API Reference](https://platform.openai.com/docs)

---

## 🎉 You're All Set!

Your MoneyQ MVP is production-ready. Start tracking your expenses and let AI help you save smarter!

**Need help?** Check the code comments or reach out to the development team.

---

**Built with ❤️ using Next.js, TypeScript, Prisma, and OpenAI**

