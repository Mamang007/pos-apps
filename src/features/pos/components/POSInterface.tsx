"use client";

import { useState } from "react";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "./ProductGrid";
import { CartPanel } from "./CartPanel";
import { PaymentModal } from "./PaymentModal";
import { type Product, type Customer } from "../types";

interface POSInterfaceProps {
  products: Product[];
  customers: Customer[];
}

export function POSInterface({ products, customers }: POSInterfaceProps) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  const handleCheckoutSuccess = (orderId: string) => {
    setIsPaymentModalOpen(false);
    setLastOrderId(orderId);
  };

  if (lastOrderId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in zoom-in-95 duration-500">
        <div className="h-24 w-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Transaction Successful!</h2>
          <p className="text-muted-foreground">
            Order ID:{" "}
            <span className="font-mono font-bold text-foreground">
              {lastOrderId}
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            The receipt has been generated and stock levels updated.
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => window.print()}>
            Print Receipt
          </Button>
          <Button onClick={() => setLastOrderId(null)}>New Transaction</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-4 overflow-hidden bg-muted/20">
      <div className="flex-1 p-6 overflow-hidden">
        <div className="flex flex-col h-full space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              Point of Sale
            </h1>
          </div>
          <ProductGrid products={products} />
        </div>
      </div>

      <div className="w-100 shrink-0">
        <CartPanel
          customers={customers}
          onCheckout={() => setIsPaymentModalOpen(true)}
        />
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handleCheckoutSuccess}
      />
    </div>
  );
}
