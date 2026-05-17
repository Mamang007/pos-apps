# Product Requirements Document (PRD) - POS Apps

## 1. Executive Summary

A modern Point of Sale (POS) system designed for small to medium-sized retail businesses.

## 2. Goals & Objectives

- Fast and intuitive checkout process.
- Real-time inventory management.
- Detailed sales reporting and analytics.

## 3. Target Audience

- Retail store owners.
- Cashiers and staff.

## 4. Key Features

### A. Master Data Management

The foundational data required to operate the POS system. Includes CRUD (Create, Read, Update, Delete) capabilities for:

- **Master Data User (Staff):** Manage cashiers, admins, and their roles/permissions. Authentication is **username-based**.
- **Master Data Customer:** Track customer profiles (Individual/Business), including contact info, unique codes, addresses, and purchase history.
- **Master Data Supplier:** Manage vendors who supply the inventory, including unique codes, contact details, and addresses.
- **Master Data Barang (Products/Items):** Comprehensive catalog management including SKU, barcode, unit of measure (UOM), pricing, categories, and stock levels.
- **Master Data Discount & Voucher:** Manage promotional rules (Percentage/Fixed) and unique voucher codes to be applied on sales.

### B. Core POS / Transaction Flow

- **Cart Management:** Scan or manually search/add items, apply discounts or taxes.
- **Payment Processing:** Handle multiple payment methods (cash, card, QRIS, etc.).
- **Receipts:** Generate and print/email digital receipts.

### C. Inventory Management

- **Stock Tracking:** Real-time deduction upon sale, low-stock alerts.
- **Stock Movement (Purchase Orders):** 
  - Handle incoming shipments via a formal Purchase Order workflow.
  - Statuses: **REQUEST** (Admin request), **ON PROCESS** (Pending arrival), **RECEIVED** (Arrived and added to stock).
  - Transitioning to "RECEIVED" automatically updates physical stock levels and records movements.
  - Manual adjustments for returns or damages.

### D. Reporting & Analytics

- **Sales Reports:** Daily, weekly, monthly summaries.

## 5. User Stories

### A. Master Data Management

- **Staff Administration**: _As an Administrator, I want to manage user profiles and permission levels so that I can ensure staff members only access the specific POS or inventory modules required for their roles._
- **Customer Relationship Management**: _As a Cashier, I want to quickly create and retrieve customer profiles during checkout so that I can track purchase history and provide personalized service._
- **Supplier & Procurement Management**: _As an Inventory Manager, I want to maintain a detailed directory of vendors and their terms so that I can efficiently generate Purchase Orders and track lead times for stock replenishment._
- **Product Catalog Control**: _As an Inventory Manager, I want to manage a comprehensive item catalog with SKUs and barcodes so that I can maintain a single source of truth for pricing and product descriptions across all transactions._
- **Promotional Rules Engine**: _As a Marketing Manager, I want to define discount rules and voucher codes so that they can be applied to specific line items during sales to drive customer loyalty._

### B. Core POS / Transaction Flow

- **Dynamic Cart Management**: _As a Cashier, I want to scan/select items into a digital cart and apply item-level discounts so that the customer receives an accurate subtotal before the final payment._
- **Flexible Payment Processing**: _As a Cashier, I want to accept multiple payment methods like QRIS and cash for a single transaction so that I can accommodate diverse customer preferences._
- **Automated Receipt Generation**: _As a Customer, I want to receive a digital receipt via email immediately after my purchase so that I have a permanent record of the items, taxes, and discounts applied._

### C. Inventory Management

- **Real-Time Stock Depletion**: _As a Business Owner, I want to see stock levels decrease automatically when a Sales Order is marked as "Shipped" or "Completed" so that I have an accurate view of physical availability._
- **Procurement Stock Integration**: _As an Inventory Clerk, I want to transition a Purchase Order status to "Received" so that the `stock_movements` table is automatically updated with the incoming quantities._
- **Threshold Alerts**: _As an Inventory Manager, I want to receive automated notifications when item levels fall below a defined threshold so that I can trigger new Purchase Orders before stockouts occur._

### D. Reporting & Analytics

- **Multi-Dimensional Sales Reporting**: _As a Business Owner, I want to generate reports that synthesize data from separate Purchase and Sales tables so that I can analyze total profit margins after accounting for procurement costs and discounts._
