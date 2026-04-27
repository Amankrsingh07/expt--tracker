-- Migration: Add Category Budget Support
-- This migration adds support for category-wise budget allocation

-- CreateTable CategoryBudget (if not already exists in your schema)
-- Add this to your prisma/schema.prisma:
/*

model CategoryBudget {
  id            Int      @id @default(autoincrement())
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId        Int
  category      Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  categoryId    Int
  monthlyBudget Float    @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([userId, categoryId])
  @@index([userId])
}

-- Update User model to include this relation:
model User {
  // ... existing fields ...
  categoryBudgets CategoryBudget[]
}

-- Update Category model to include this relation:
model Category {
  // ... existing fields ...
  budgets CategoryBudget[]
}

*/

-- After adding to schema.prisma, run:
-- npx prisma migrate dev --name add_category_budgets

-- This will:
-- 1. Create the CategoryBudget table
-- 2. Add foreign key relationships
-- 3. Update Prisma client
-- 4. Generate migration file

-- If you want to add budget history:
/*

model BudgetHistory {
  id            Int      @id @default(autoincrement())
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId        Int
  month         String   (YYYY-MM format)
  monthlyLimit  Float
  spent         Float
  remaining     Float
  percentUsed   Float
  createdAt     DateTime @default(now())

  @@unique([userId, month])
  @@index([userId, month])
}

*/
