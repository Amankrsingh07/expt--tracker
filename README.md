# 💰 Expense Tracker SystemA full-stack **Expense Tracker Web Application** built using **Next.js, Prisma ORM, and MySQL**.  This app helps users manage **income, expenses, and budgets** with powerful **month-wise tracking** and smart financial insights.---## 🚀 Features### ✅ Core Features- Add / Delete **Expenses**- Add / Delete **Income**- **Category-wise Budget Management**- **Month-wise filtering** (key feature)- Dashboard showing:  - Total Income  - Total Expense  - Remaining Balance---### 📊 Advanced Features- 🚨 Budget limit alerts- 📅 Month-based data tracking- 🔍 Search & filter expenses- 📂 Category-based expense grouping- 🔔 Notification system- 📈 Summary cards & insights- 🌙 Dark mode support---## 🧠 Smart System Logic- Every record is **month-based**- Budget is linked using:  
user + category + month
- Prevents overspending using:- Budget warnings- Hard stop when limit exceeded---## 🛠 Tech Stack### Frontend- Next.js (App Router)- React.js- Tailwind CSS### Backend- Next.js API Routes- Prisma ORM### Database- MySQL### Authentication- JWT (cookie-based)---## 📁 Project Structure
app/
dashboard/
expenses/
incomes/
budget/
api/
components/
lib/
prisma/
public/
---## ⚙️ Setup Instructions### 1️⃣ Clone the project```bashgit clone https://github.com/your-username/expense-tracker.gitcd expense-tracker
2️⃣ Install dependencies
npm install
3️⃣ Setup environment variables
Create a .env file:
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/expense_tracker"JWT_SECRET="your_secret_key"

4️⃣ Setup database
npx prisma migrate devnpx prisma generate

5️⃣ Run the project
npm run dev
Open in browser:
http://localhost:3000

📊 Database Models
Main tables used:


User


Expense


Income


Budget


Category


Notification



🎯 Key Highlight (Interview Ready)

This project demonstrates real-world financial tracking using
month-wise filtering + category budgeting + alert system


💡 Future Improvements


🤖 AI spending insights


📊 Graphs (Chart.js / Recharts)


📁 Export to Excel / PDF


📱 Mobile App (React Native)


🔁 Recurring transactions



📸 Screenshots
(Add your project screenshots here)

👨‍💻 Author
Aman Kumar Singh

⭐ Support
If you like this project, give it a ⭐ on GitHub!
---If you want 🔥 **GitHub-ready version (with badges + live demo + deploy guide)**  just say:👉 *"make README pro + deployment"*
