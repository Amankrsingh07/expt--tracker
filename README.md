# Expense Tracker (Next.js + Prisma + MySQL)

This project is a scaffold for an Expense Tracker application using Next.js App Router, Prisma (MySQL), JWT auth, Tailwind CSS and Recharts for charts.

What I added:
- Prisma schema (prisma/schema.prisma)
- Prisma client wrapper (lib/prisma.js)
- Auth helpers (lib/auth.js)
- API routes under `app/api/*` for auth, expenses, categories and limit
- Pages for signup, login, dashboard, expenses list and add-expense
- Components: Layout, Navbar, ExpenseForm, DashboardCharts
- Hook: `hooks/useUser.js`

Important env variables (.env):

DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="a-long-secret"

Setup instructions:

1. Install dependencies

   npm install next react react-dom prisma @prisma/client bcryptjs jsonwebtoken react-hook-form zod recharts tailwindcss postcss autoprefixer

2. Initialize Prisma client (generate)

   npx prisma generate

3. Create migration and push to your MySQL database

   npx prisma migrate dev --name init

4. Start dev server

   npm run dev

Notes and next steps:
- This scaffold focuses on core functionality. For production you'd want stricter validation (zod + react-hook-form), better error handling, rate limiting and email verification.
- Install and configure shadcn/ui components (I used simple components here). Replace plain elements with shadcn components for the refined UI.
- Add toasts and skeletons via shadcn or your choice of UI primitives.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
