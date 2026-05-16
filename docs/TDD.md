# Technical Design Document (TDD) - POS Apps

## 1. Architecture Overview

- **Frontend**: Next.js (App Router, Server Components).
- **State Management**: Zustand for global state and cart management.
- **Database**: PostgreSQL with **Drizzle ORM** (Primary data access layer).
- **Authentication**: **Auth.js (NextAuth)** or **Clerk** (Preferred for portability).
- **PWA**: `next-pwa` for service worker management and manifest configuration.
- **Styling**: Tailwind CSS.

## 2. Portability & Implementation Rules

### ORM (Drizzle)

- **Rule**: Always use Drizzle ORM for database interactions.
- **Avoid**: Do not use the `supabase-js` client for data fetching to ensure portability. Use Drizzle's `db.select()`, `db.insert()`, etc.

### Authentication

- **Strategy**: Use Auth.js or Clerk instead of Supabase Auth.
- **Portability**: If using Auth.js, ensure users and accounts tables are managed directly in the PostgreSQL database. This allows user data to migrate seamlessly if the database provider changes.

## 3. Data Model

### A. Master Data
- **roles**: `id`, `name`, `permissions` (JSON), `createdAt`, `updatedAt`
- **users**: `id`, `roleId` (FK), `name`, `email`, `passwordHash`, `createdAt`, `updatedAt`
- **suppliers**: `id`, `name`, `contactName`, `phone`, `email`, `address`, `createdAt`, `updatedAt`
- **customers**: `id`, `name`, `phone`, `email`, `loyaltyPoints`, `createdAt`, `updatedAt`
- **categories**: `id`, `name`, `description`, `createdAt`, `updatedAt`
- **products**: `id`, `categoryId` (FK), `sku` (unique), `barcode`, `name`, `description`, `costPrice`, `sellPrice`, `minStockLevel`, `createdAt`, `updatedAt`
- **discounts**: `id`, `name`, `type` (PERCENTAGE, FIXED), `value`, `minPurchase`, `maxDiscount`, `startDate`, `endDate`, `isActive`
- **vouchers**: `id`, `code` (unique), `discountId` (FK), `isUsed`, `usedAt`, `createdAt`

### B. Core POS / Transaction Flow
- **purchase_orders**: `id`, `supplierId` (FK), `userId` (FK), `orderDate`, `totalAmount`, `status` (PENDING, RECEIVED, CANCELLED)
- **po_items**: `id`, `poId` (FK), `productId` (FK), `quantity`, `unitCost`, `subtotal`
- **sales_orders**: `id`, `customerId` (FK - nullable), `userId` (FK), `saleDate`, `subtotal`, `taxAmount`, `discountAmount`, `totalAmount`, `status` (COMPLETED, CANCELLED)
- **so_items**: `id`, `soId` (FK), `productId` (FK), `quantity`, `unitPrice`, `discountId` (FK - nullable), `discountAmount`, `taxAmount`, `subtotal`
- **sales_order_payments**: `id`, `soId` (FK), `paymentMethod` (CASH, QRIS, CARD), `amount`, `paymentData` (JSON), `createdAt`

### C. Inventory Management
- **stocks**: `id`, `productId` (FK), `quantity`, `lastUpdated`
- **stock_movements**: `id`, `productId` (FK), `changeQuantity`, `type` (SALE, PURCHASE, ADJUSTMENT, RETURN), `referenceId` (UUID), `userId` (FK), `createdAt`

### D. Authentication (Auth.js / NextAuth)
These tables are required by the Auth.js Drizzle Adapter to manage database-backed sessions and OAuth providers.
- **accounts**: `id`, `userId` (FK), `type`, `provider`, `providerAccountId`, `refresh_token`, `access_token`, `expires_at`, `token_type`, `scope`, `id_token`, `session_state`
- **sessions**: `id`, `sessionToken` (unique), `userId` (FK), `expires`
- **verification_tokens**: `identifier`, `token` (unique), `expires`

## 4. API Routes (Example)

- `GET /api/products`: Fetch all products.
- `POST /api/orders`: Create a new transaction.

## 5. Infrastructure

### Deployment

- **Platform**: Vercel (Frontend/Next.js) or **Docker for VPS**.
- **VPS Setup**: Use Docker to containerize the Next.js app, PostgreSQL, and a connection pooler (e.g., PgBouncer).

### Database

- **Providers**: Supabase, Neon, or self-hosted PostgreSQL.
- **Connection**: Always use a connection pooler for serverless environments.
