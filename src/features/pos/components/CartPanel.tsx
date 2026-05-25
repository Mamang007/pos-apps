"use client";

import { useState, useMemo } from "react";
import {
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  UserPlus,
  Ticket,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "../hooks/use-cart";
import { type Customer } from "../types";
import { validateVoucherCode } from "../services/actions";

interface CartPanelProps {
  customers: Customer[];
  onCheckout: () => void;
}

export function CartPanel({ customers, onCheckout }: CartPanelProps) {
  const {
    items,
    customer,
    voucher,
    removeItem,
    updateQuantity,
    setCustomer,
    applyVoucher,
    removeVoucher,
  } = useCart();
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");

  const [voucherInput, setVoucherInput] = useState("");
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState("");

  const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);

  const discount = useMemo(() => {
    if (!voucher) return 0;
    const { discount } = voucher;
    let amount = 0;

    if (discount.scope === "TRANSACTION") {
      if (discount.type === "PERCENTAGE") {
        amount = (subtotal * Number(discount.value)) / 100;
      } else {
        amount = Number(discount.value);
      }
    } else if (discount.scope === "PRODUCT") {
      const eligibleItems = items.filter(
        (i) => i.productId === discount.productId,
      );
      const eligibleSubtotal = eligibleItems.reduce(
        (acc, i) => acc + i.subtotal,
        0,
      );
      if (discount.type === "PERCENTAGE") {
        amount = (eligibleSubtotal * Number(discount.value)) / 100;
      } else {
        amount = Math.min(Number(discount.value), eligibleSubtotal);
      }
    } else if (discount.scope === "CATEGORY") {
      const eligibleItems = items.filter(
        (i) => i.categoryId === discount.categoryId,
      );
      const eligibleSubtotal = eligibleItems.reduce(
        (acc, i) => acc + i.subtotal,
        0,
      );
      if (discount.type === "PERCENTAGE") {
        amount = (eligibleSubtotal * Number(discount.value)) / 100;
      } else {
        amount = Math.min(Number(discount.value), eligibleSubtotal);
      }
    }

    if (discount.maxDiscount && amount > Number(discount.maxDiscount)) {
      amount = Number(discount.maxDiscount);
    }

    return amount;
  }, [items, voucher, subtotal]);

  const tax = subtotal * 0.11; // 11% tax
  const total = subtotal + tax - discount;

  const handleApplyVoucher = async () => {
    if (!voucherInput) return;
    setIsValidatingVoucher(true);
    setVoucherError("");

    const result = await validateVoucherCode(voucherInput, items);
    if (result.success && result.discount) {
      applyVoucher(voucherInput, result.discount);
      setVoucherInput("");
    } else {
      setVoucherError(result.error || "Invalid voucher");
    }
    setIsValidatingVoucher(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      (c.phone && c.phone.includes(customerSearch)),
  );

  return (
    <div className="flex flex-col h-full bg-card border-l border-border shadow-lg">
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            Current Order
            <span className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full">
              {items.length} items
            </span>
          </h3>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={() => useCart.getState().clearCart()}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {customer ? (
          <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                {customer.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold">{customer.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {customer.phone || "No phone"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[10px]"
              onClick={() => setCustomer(null)}
            >
              Change
            </Button>
          </div>
        ) : (
          <div className="relative">
            {!showCustomerSearch ? (
              <Button
                variant="outline"
                className="w-full justify-start text-muted-foreground border-dashed"
                onClick={() => setShowCustomerSearch(true)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Select Customer (Optional)
              </Button>
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder="Search customer..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="h-9"
                  autoFocus
                />
                {customerSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-40 overflow-y-auto">
                    {filteredCustomers.map((c) => (
                      <div
                        key={c.id}
                        className="p-2 hover:bg-muted cursor-pointer text-sm"
                        onClick={() => {
                          setCustomer(c);
                          setShowCustomerSearch(false);
                          setCustomerSearch("");
                        }}
                      >
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.phone}
                        </p>
                      </div>
                    ))}
                    {filteredCustomers.length === 0 && (
                      <p className="p-2 text-xs text-muted-foreground italic text-center">
                        No customers found
                      </p>
                    )}
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-7 text-[10px]"
                  onClick={() => setShowCustomerSearch(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {items.map((item) => (
          <div key={item.productId} className="flex gap-3 group">
            <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0 overflow-hidden">
              {item.name.charAt(0)}
            </div>
            <div className="flex-1 space-y-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <p className="font-medium text-sm line-clamp-2 leading-tight">
                  {item.name}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100"
                  onClick={() => removeItem(item.productId)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs font-bold text-primary">
                {formatCurrency(item.sellPrice)}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-border rounded-md">
                  <button
                    className="p-1 hover:bg-muted text-muted-foreground disabled:opacity-20"
                    onClick={() =>
                      updateQuantity(
                        item.productId,
                        Math.max(1, item.quantity - 1),
                      )
                    }
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold">
                    {item.quantity}
                  </span>
                  <button
                    className="p-1 hover:bg-muted text-muted-foreground"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <p className="text-xs font-bold ml-auto">
                  {formatCurrency(item.subtotal)}
                </p>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-10 opacity-50">
            <Banknote className="h-10 w-10 mb-4" />
            <p className="text-sm">No items in cart</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border bg-muted/30 space-y-3">
        {/* Voucher Section */}
        <div className="space-y-2">
          {voucher ? (
            <div className="flex items-center justify-between p-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold">{voucher.code}</span>
              </div>
              <button
                onClick={removeVoucher}
                className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded"
              >
                <X className="h-3 w-3 text-emerald-600" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Ticket className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Voucher code"
                  value={voucherInput}
                  onChange={(e) =>
                    setVoucherInput(e.target.value.toUpperCase())
                  }
                  className="h-9 pl-8 text-xs font-mono"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 text-xs"
                onClick={handleApplyVoucher}
                disabled={isValidatingVoucher || !voucherInput}
              >
                Apply
              </Button>
            </div>
          )}
          {voucherError && (
            <p className="text-[10px] text-destructive italic ml-1">
              {voucherError}
            </p>
          )}
        </div>

        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Tax (11%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium animate-in slide-in-from-right-2 duration-300">
              <span className="flex items-center gap-1">
                Discount
                {voucher && (
                  <span className="text-[10px] px-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400 rounded uppercase">
                    {voucher.discount.scope}
                  </span>
                )}
              </span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-border text-foreground">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(total)}</span>
          </div>
        </div>

        <Button
          className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20"
          disabled={items.length === 0}
          onClick={onCheckout}
        >
          <CreditCard className="mr-2 h-5 w-5" />
          CHECKOUT
        </Button>
      </div>
    </div>
  );
}
