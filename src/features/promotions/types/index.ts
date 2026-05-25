import { z } from "zod";
import { discounts, vouchers } from "@/lib/db/schema";

export const discountSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Name is required"),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  scope: z.enum(["TRANSACTION", "PRODUCT", "CATEGORY"]).default("TRANSACTION"),
  value: z.string().min(1, "Value is required"),
  minPurchase: z.string().default("0"),
  maxDiscount: z.string().optional().nullable(),
  productId: z.string().uuid().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
  isActive: z.boolean().default(true),
}).refine((data) => {
  if (data.scope === "PRODUCT" && !data.productId) return false;
  return true;
}, {
  message: "Product is required for Product-level discount",
  path: ["productId"],
}).refine((data) => {
  if (data.scope === "CATEGORY" && !data.categoryId) return false;
  return true;
}, {
  message: "Category is required for Category-level discount",
  path: ["categoryId"],
});

export type DiscountInput = z.infer<typeof discountSchema>;
export type Discount = typeof discounts.$inferSelect;

export const voucherSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().min(1, "Code is required"),
  discountId: z.string().uuid("Please select a discount rule"),
});

export type VoucherInput = z.infer<typeof voucherSchema>;
export type Voucher = typeof vouchers.$inferSelect;

export type VoucherWithDiscount = Voucher & {
  discount: Discount | null;
};
