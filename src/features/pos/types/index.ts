import { salesOrders, soItems, salesOrderPayments, products, customers, users, discounts } from "@/lib/db/schema";
import { type InferSelectModel } from "drizzle-orm";

export type SalesOrder = InferSelectModel<typeof salesOrders>;
export type SalesOrderItem = InferSelectModel<typeof soItems>;
export type SalesOrderPayment = InferSelectModel<typeof salesOrderPayments>;
export type Product = InferSelectModel<typeof products> & {
  stock?: number;
};
export type Customer = InferSelectModel<typeof customers>;
export type User = InferSelectModel<typeof users>;
export type Discount = InferSelectModel<typeof discounts>;

export type SalesOrderWithDetails = SalesOrder & {
  customer: Customer | null;
  user: User;
  items: (SalesOrderItem & {
    product: Product;
  })[];
  payments: SalesOrderPayment[];
};

export interface CartItem {
  productId: string;
  categoryId?: string | null;
  name: string;
  sku: string;
  sellPrice: number;
  quantity: number;
  subtotal: number;
}

export interface CheckoutInput {
  customerId?: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: "CASH" | "QRIS" | "CARD";
  amountPaid: number;
  voucherCode?: string;
}
