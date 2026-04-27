This file was cleared programmatically.
If you need the original documentation back, restore from version control or request a backup.
- Add expenses with category and description
- View expenses by category
- Filter expenses by month/year
- Track spending patterns

### 3. **Budget System**
- Set **monthly overall budget limit**
- Allocate **category-wise budgets**
- Real-time budget vs spending comparison
- Budget alerts when approaching limit (80%) or exceeding

### 4. **Financial Dashboard**
Two views available:
- **Simple View**: Charts showing expense distribution
- **Advanced View**: Comprehensive analytics with multiple charts

### 5. **Reports & Analytics**
- Income source breakdown
- Expense by category
- Budget utilization percentage
- Savings calculation
- Monthly comparisons

---

## 🏗️ Architecture

### New API Endpoints

#### 1. Dashboard Summary
```
GET /api/dashboard/summary?month=2026-04
```
Returns comprehensive financial overview:
```json
{
  "period": { "month": "2026-04", "year": 2026 },
  "income": {
    "total": 50000,
    "bySource": { "Salary": 40000, "Freelance": 10000 },
    "count": 2
  },
  "expenses": {
    "total": 15000,
    "byCategory": { "Food": 3000, "Transport": 2000, ... },
    "categoryDetails": { ... },
    "count": 45
  },
  "budget": {
    "monthlyLimit": 20000,
    "spent": 15000,
    "remaining": 5000,
    "percentUsed": 75,
    "categoryBudgets": {
      "Food": { "allocated": 5000, "spent": 3000, "remaining": 2000, "percentUsed": 60 },
      ...
    }
  },
  "savings": {
    "total": 35000,
    "rate": 70.0
  },
  "status": {
    "isBudgetExceeded": false,
    "warning": null
  }
}
```

#### 2. Category Budget Management
```
POST /api/category-budget
{
  "categoryId": 1,
  "monthlyBudget": 5000
}
```

```
GET /api/category-budget
```

---

## 📄 Pages

### 1. Dashboard (`/dashboard`)
- Quick overview of spending
- Simple and Advanced view toggle
- Basic charts and metrics
- Quick stats cards

### 2. Budget Tracking (`/budget`)
- Comprehensive budget page
- Overall budget status
- Category-wise budget allocation
- Budget vs spending comparison
- Detailed expense breakdown

### 3. Financial Summary (`/summary`)
- Complete financial overview
- Income sources breakdown
- Expense details by category
- Category-wise budget tracking
- Savings rate calculation

### 4. Add Income (`/add-income`)
- Form to add new income
- Select income source
- Track date and amount

### 5. Expenses (`/expenses`)
- View all expenses
- Filter by category/month
- Edit/Delete expenses

### 6. Categories (`/categories`)
- Manage expense categories
- Create custom categories
- Assign budgets to categories

---

## 📊 Calculations & Metrics

### 1. Total Income
```
Total Income = Sum of all income entries
```

### 2. Total Expenses
```
Total Expenses = Sum of all expense entries in current month
```

### 3. Category-Wise Spending
```
Category Spent = Sum of expenses in that category
Allocated = Budget assigned to that category
Remaining = Allocated - Spent
Percent Used = (Spent / Allocated) × 100
```

### 4. Overall Budget
```
Monthly Spent = Total Expenses
Monthly Limit = Budget limit set by user
Remaining Budget = Monthly Limit - Monthly Spent
Percent Used = (Monthly Spent / Monthly Limit) × 100
```

### 5. Savings
```
Savings = Total Income - Total Expenses
Savings Rate = (Savings / Total Income) × 100
```

### 6. Budget Status
```
Budget Exceeded = Monthly Spent > Monthly Limit
Warning = Monthly Spent > (Monthly Limit × 0.8)
```

---

## 🎨 Components

### 1. **FinancialDashboard** (`/components/FinancialDashboard.jsx`)
Advanced analytics component with:
- Income source pie chart
- Expense category pie chart
- Budget vs spending bar chart
- Category-wise summary table
- Monthly comparison metrics

### 2. **DashboardCharts** (`/components/DashboardCharts.jsx`)
Simple expense visualization with:
- Category distribution
- Monthly trends
- Daily spending trend

### 3. **Layout** (`/components/Layout.jsx`)
Navigation and layout wrapper

---

## 🔄 Data Flow

```
User Input
  ↓
API Routes (/api/incomes, /api/expenses, /api/budget)
  ↓
Prisma ORM → Database
  ↓
Summary API (/api/dashboard/summary)
  ↓
Components (FinancialDashboard, Budget Page)
  ↓
UI Display
```

---

## 💾 Database Schema

### Income Model
```
id          String   @id @default(cuid())
user        User     @relation(fields: [userId], references: [id])
userId      Int
amount      Float
source      String   (Salary, Freelance, Business, Other)
date        DateTime @default(now())
createdAt   DateTime @default(now())
```

### Expense Model
```
id          Int      @id @default(autoincrement())
user        User     @relation(fields: [userId], references: [id])
userId      Int
amount      Float
category    Category @relation(fields: [categoryId], references: [id])
categoryId  Int
description String?
date        DateTime
```

### Category Model
```
id       Int       @id @default(autoincrement())
user     User      @relation(fields: [userId], references: [id])
userId   Int
name     String
expenses Expense[]
```

### Limit Model
```
id           Int    @id @default(autoincrement())
user         User   @relation(fields: [userId], references: [id])
userId       Int    @unique
monthlyLimit Float  (Overall monthly budget)
```

### CategoryBudget Model (Optional)
```
id            Int    @id @default(autoincrement())
user          User   @relation(fields: [userId], references: [id])
userId        Int
category      Category @relation(fields: [categoryId], references: [id])
categoryId    Int
monthlyBudget Float  (Category-specific budget)
```

---

## 🚀 Usage Examples

### 1. Add Income
```bash
curl -X POST http://localhost:3000/api/incomes \
  -H "Content-Type: application/json" \
  -d '{"amount":50000,"source":"Salary"}'
```

### 2. Add Expense
```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{"amount":500,"categoryId":1,"description":"Lunch","date":"2026-04-27"}'
```

### 3. Get Financial Summary
```bash
curl http://localhost:3000/api/dashboard/summary?month=2026-04
```

### 4. Set Budget Limit
```bash
curl -X POST http://localhost:3000/api/budget \
  -H "Content-Type: application/json" \
  -d '{"monthlyLimit":20000}'
```

---

## 🎯 Features in Action

### Dashboard View
- Shows Welcome message
- Quick stats: This Month Spent, Monthly Limit, Remaining Budget
- Toggle between Simple View (charts) and Advanced View (analytics)

### Budget Page
- Overall budget progress bar
- Alert if budget exceeded (>100%)
- Warning if approaching limit (>80%)
- Category-wise breakdown
- Remaining budget per category
- Expense details grouped by category

### Summary Page
- 4 metric cards: Income, Expenses, Budget %, Savings
- Income breakdown by source
- Budget status with progress bar
- Complete category-wise table
- Recent expenses list

---

## 🔧 Configuration

### Environment Variables
```
DATABASE_URL="mysql://user:password@localhost:3306/expense_tracker"
JWT_SECRET="your_secret_key"
```

### Default Settings
- Monthly Budget: User sets via `/api/budget` POST
- Category Budgets: Optional allocation per category
- Refresh Rate: Dashboard updates every 10 seconds

---

## 📱 Responsive Design
- Mobile-first approach
- Grid layouts: 1 column (mobile) → 2-4 columns (desktop)
- Dark mode support
- Touch-friendly buttons and inputs

---

## ✅ Testing Checklist

- [ ] Add multiple incomes (salary, freelance)
- [ ] Add expenses in different categories
- [ ] Set overall budget limit
- [ ] Allocate category-wise budgets
- [ ] View dashboard with simple charts
- [ ] Switch to advanced analytics
- [ ] Check budget page for alerts
- [ ] Verify summary page calculations
- [ ] Test month selection
- [ ] Verify savings rate calculation

---

## 🐛 Debugging

### View API errors
Check browser console and terminal logs:
```bash
# See dashboard summary errors
curl http://localhost:3000/api/dashboard/summary?month=2026-04
```

### Check database connection
Ensure MySQL is running and DATABASE_URL is correct.

### Reset data
```bash
# Re-run Prisma migrations
npx prisma migrate dev
```

---

## 📈 Future Enhancements
- [ ] Category-wise budget alerts via email
- [ ] Recurring expenses (monthly subscriptions)
- [ ] Export reports to PDF/CSV
- [ ] Investment tracking
- [ ] Debt management
- [ ] Income goals
- [ ] Spending predictions
- [ ] Mobile app

---

## 📞 Support
For issues or questions, check:
1. `/api/dashboard/summary` response
2. Prisma schema in `prisma/schema.prisma`
3. Network tab in browser DevTools
