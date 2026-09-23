# FinPulse — Smart Personal Finance Tracker

A modern, responsive, portfolio-grade Personal Finance Tracker built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, and a deterministic **Rule-Based Smart Insights Engine**.

Designed for seamless demonstrations, FinPulse works immediately out of the box with zero external configuration via its local persistent storage layer and pre-seeded realistic Indian Rupee (₹) dataset, while also providing full support for **Supabase** (PostgreSQL + Auth + Row Level Security).

---

## 🌟 Key Features

### 1. 🔐 Dual-Mode Authentication & Demo Showcase
- **1-Click Instant Demo Login**: Pre-seeded with 3 months of realistic Indian financial data for `Arjun Sharma` (₹85,000 monthly salary, Indiranagar rent, broadband, dining, SIPs, tech purchases).
- **Supabase Integration**: Seamless email/password authentication with PostgreSQL schema and Row Level Security (RLS) if `.env` credentials are provided.
- **Session Persistence**: Saves all user state and transactions to browser `localStorage` when offline.

### 2. 📊 Executive Financial Dashboard
- **Real-Time KPIs**: Total Balance, Monthly Income, Monthly Outgoings, Net Savings, and Remaining Budget Buffer.
- **Category Donut Chart**: Interactive Recharts visualization with hover tooltips and INR percentage share.
- **Income vs. Expense Bar Chart**: 6-month dual-bar historical trend analysis.
- **Recent Transactions Feed**: Categorized transactions with payment method pills and one-click edit/delete.
- **Dynamic Smart Insight Banner**: Highlights urgent financial observations on the top of the dashboard.

### 3. 💳 Transactions Management (Full CRUD)
- Add, edit, and delete transactions with a modal validated via **React Hook Form** and **Zod**.
- **Fields**: Date, Type (Income / Expense), Category, Amount (₹), Description, Payment Method (UPI, Credit Card, Debit Card, Net Banking, Cash), Recurring flag, and Notes.
- **11 Categories**: Salary, Freelance, Food & Dining, Transport, Rent, Bills, Shopping, Health, Entertainment, Education, and Other.
- **Search & Filters**: Instant search by description, category, or note, plus filter by type, category, payment method, or date range.
- **Sorting**: Newest/oldest, highest/lowest amount.
- **Confirmation Dialog**: Protective modal before deleting any transaction.
- **Export to CSV**: Instant one-click export of filtered transaction lists.

### 4. 🎯 Monthly Category Budgets
- Set spending caps per category for any month.
- Visual progress bars with adaptive color indicators:
  - 🟢 **On Track** (< 80% used)
  - 🟡 **Near Limit** (80% - 99% used)
  - 🔴 **Over Budget** (≥ 100% used)
- Real-time remaining buffer and overshoot calculations.

### 5. 🏆 Savings Goals & Contributions
- Create goals with target amount, current saved amount, deadline date, and custom color accents.
- Automated calculation of **days remaining** and **required monthly savings rate** to meet deadlines.
- **Contribute Modal**: Allocate savings with quick-pick chips (+₹1,000, +₹5,000, etc.) and note logs.
- **Milestone Celebration**: Triggers celebratory confetti when a goal reaches 100% completion!

### 6. 📈 Reports & Deep Analytics
- Select any month or custom calendar date range.
- Financial health KPIs: Savings Rate %, Top Cost Driver %, Total Inflows & Outflows.
- **Daily Spend Burn Trend**: Area chart showing daily spending surges across the timeframe.
- **Category Breakdown Ranking**: Percentage share of each category with visual progress meters.
- **Top 5 Largest Outgoings**: Fast discovery of major budget drains.
- **CSV Report Export**: Download full custom reports into spreadsheets.

### 7. 🧠 Rule-Based Smart Insights Engine (100% Local)
A deterministic financial analysis engine in `src/utils/smartInsights.ts` that runs entirely on client devices with **zero external AI APIs or paid tokens**:
1. **Month-over-Month Category Drift**: Compares current spending vs. prior month and flags surges (e.g. *"Food & Dining spending is 22% higher than last month"*).
2. **Burn-Rate Budget Exhaustion Forecast**: Projects daily spend velocity and warns users ahead of time (e.g. *"You may exceed your Shopping budget in 6 days at current pace of ₹420/day"*).
3. **Recurring & Subscription Pattern Detector**: Identifies repeated monthly charges (Netflix ₹649, ACT Fibernet ₹999, Cult.fit Gym ₹1,800).
4. **Savings Goal Feasibility & Actionable Trade-Offs**: Compares net cashflow against required monthly goal deposits and suggests realistic trade-offs (e.g. *"Reducing Entertainment spending by ₹500/month could help meet your Laptop goal on time"*).
5. **Transparent Explanations**: Expandable *"How this was calculated"* drawer on every card showing exact formulas, prior month figures, and verification data.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18 + TypeScript |
| **Build Tool** | Vite 5 |
| **Styling** | Tailwind CSS (Dark/Light mode, Glassmorphism, Responsive) |
| **Icons** | Lucide React |
| **Visualizations** | Recharts (PieChart, BarChart, AreaChart) |
| **State Management** | Zustand with LocalStorage persistence |
| **Form Validation** | React Hook Form + Zod |
| **Testing** | Vitest (13 automated unit tests) |
| **Celebrations** | Canvas Confetti |
| **Backend & DB** | Local Mock Storage Engine + Optional Supabase (PostgreSQL) |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18 or higher, tested on v24)
- npm (v9 or higher)

### 2. Clone & Install
```bash
git clone <repo-url>
cd "personal finance tracker"
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 4. Run Automated Unit Tests
```bash
npm test
```
Runs 13 unit tests covering financial balance logic, budget calculations, currency formatting, and the deterministic Smart Insights engine.

---

## 📂 Project Structure

```
personal-finance-tracker/
├── .env.example                     # Environment template
├── index.html                       # Entry HTML with Google Fonts
├── package.json                     # Dependencies and scripts
├── postcss.config.js                # PostCSS configuration
├── tailwind.config.js               # Tailwind CSS theme & tokens
├── tsconfig.json                    # TypeScript compiler settings
├── vite.config.ts                   # Vite bundler configuration
├── supabase/
│   └── schema.sql                   # PostgreSQL schema, RLS policies, triggers
└── src/
    ├── App.tsx                      # Root component with view routing
    ├── main.tsx                     # React DOM entrypoint
    ├── index.css                    # Tailwind directives & glass tokens
    ├── components/
    │   ├── auth/
    │   │   └── AuthModal.tsx        # Sign in, Sign up & Demo login modal
    │   ├── budgets/
    │   │   ├── BudgetModal.tsx      # Add/edit monthly category limits
    │   │   └── BudgetsView.tsx      # Budget gauges & warning flags
    │   ├── common/
    │   │   ├── ConfirmDialog.tsx    # Deletion confirmation modal
    │   │   ├── Modal.tsx            # Accessible modal container
    │   │   └── StatCard.tsx         # Metric KPI card
    │   ├── dashboard/
    │   │   └── DashboardView.tsx    # Executive dashboard & charts
    │   ├── goals/
    │   │   ├── ContributeModal.tsx  # Deposit savings with confetti
    │   │   ├── GoalModal.tsx        # Add/edit target goals
    │   │   └── GoalsView.tsx        # Goal milestones & monthly rates
    │   ├── insights/
    │   │   └── SmartInsightsView.tsx # Actionable cards with math formulas
    │   ├── layout/
    │   │   ├── Navbar.tsx           # Logo, month picker, theme toggle
    │   │   └── Sidebar.tsx          # Desktop sidebar & mobile navigation
    │   ├── reports/
    │   │   └── ReportsView.tsx      # Analytics, daily burn & CSV export
    │   └── transactions/
    │       ├── TransactionModal.tsx # Add/edit transaction form (Zod)
    │       └── TransactionsView.tsx # Transactions table, search & filter
    ├── data/
    │   └── seedData.ts              # Realistic 3-month Indian Rupee dataset
    ├── services/
    │   └── supabaseClient.ts        # Supabase client with offline fallback
    ├── store/
    │   └── useFinanceStore.ts       # Zustand store with persistence
    ├── types/
    │   └── finance.ts               # Core TypeScript data contracts
    └── utils/
        ├── categoryHelpers.ts       # Categories, colors & Lucide icons
        ├── currencyFormatter.ts     # Indian Rupee (INR) formatting
        ├── financeCalculations.ts   # Core math & budget algorithms
        ├── smartInsights.ts         # Deterministic financial intelligence
        └── __tests__/
            ├── currencyFormatter.test.ts
            ├── financeCalculations.test.ts
            └── smartInsights.test.ts
```

---

## 🗄️ Database Design (Supabase / PostgreSQL)

For deployments using Supabase, apply [`supabase/schema.sql`](file:///supabase/schema.sql) in your Supabase SQL Editor:
- **`profiles`**: User profiles with currency preferences linked to `auth.users`.
- **`transactions`**: Inflows and outflows with type, category, date, and payment method.
- **`budgets`**: Unique constraints per `(user_id, category, period)`.
- **`savings_goals`**: Milestones with target amount, deadlines, and current progress.
- **`goal_contributions`**: Ledger recording every deposit made toward a savings goal.
- **Row Level Security (RLS)**: Enforces that users can only query, insert, update, or delete their own data.

---

## 🔮 Future Improvements
- Multi-currency conversion via real-time FX rates.
- Bank SMS / UPI notification parser for automated transaction import.
- PDF statement generation with charts and tables for tax accounting.
- Splitwise-style group bill splitting with roommates or travel companions.
