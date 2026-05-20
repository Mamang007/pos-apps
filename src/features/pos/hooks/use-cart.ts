import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type CartItem, type Customer, type Product } from "../types";

interface CartState {
  items: CartItem[];
  customer: Customer | null;
  voucher: { code: string; discountAmount: number } | null;
  
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setCustomer: (customer: Customer | null) => void;
  applyVoucher: (code: string, discountAmount: number) => void;
  clearCart: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      customer: null,
      voucher: null,

      addItem: (product: Product) =>
        set((state) => {
          const existingItem = state.items.find((item) => item.productId === product.id);
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.productId === product.id
                  ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * Number(product.sellPrice) }
                  : item
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                name: product.name,
                sku: product.sku,
                sellPrice: Number(product.sellPrice),
                quantity: 1,
                subtotal: Number(product.sellPrice),
              },
            ],
          };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId
              ? { ...item, quantity, subtotal: quantity * item.sellPrice }
              : item
          ),
        })),

      setCustomer: (customer) => set({ customer }),

      applyVoucher: (code, discountAmount) => set({ voucher: { code, discountAmount } }),

      clearCart: () => set({ items: [], customer: null, voucher: null }),
    }),
    {
      name: "pos-cart-storage",
    }
  )
);
