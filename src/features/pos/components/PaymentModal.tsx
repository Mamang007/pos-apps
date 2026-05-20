"use client";

import { useState } from "react";
import { CreditCard, Banknote, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useCart } from "../hooks/use-cart";
import { checkoutAction } from "../services/actions";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}

export function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
  const { items, customer, voucher, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "QRIS" | "CARD">("CASH");
  const [amountPaid, setAmountPaid] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
  const tax = subtotal * 0.11;
  const discount = voucher?.discountAmount || 0;
  const total = subtotal + tax - discount;

  const change = Math.max(0, Number(amountPaid) - total);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleSubmit = async () => {
    if (paymentMethod === "CASH" && Number(amountPaid) < total) {
      alert("Amount paid must be greater than or equal to total.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await checkoutAction({
        customerId: customer?.id,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.sellPrice,
          subtotal: item.subtotal
        })),
        subtotal,
        taxAmount: tax,
        discountAmount: discount,
        totalAmount: total,
        paymentMethod,
        amountPaid: paymentMethod === "CASH" ? Number(amountPaid) : total,
        voucherCode: voucher?.code
      });

      if ("success" in result && result.success) {
        clearCart();
        onSuccess(result.id!);
      } else {
        alert("error" in result ? result.error : "Checkout failed");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose}
      title="Complete Transaction"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || (paymentMethod === "CASH" && Number(amountPaid) < total)}
            className="px-8 font-bold"
          >
            {isSubmitting ? "Processing..." : "Finish Payment"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-6 py-4">
        <div className="bg-muted/50 p-4 rounded-lg flex justify-between items-center">
          <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Total Amount</span>
          <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-bold">Select Payment Method</p>
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant={paymentMethod === "CASH" ? "default" : "outline"}
              className="h-20 flex-col gap-2"
              onClick={() => setPaymentMethod("CASH")}
            >
              <Banknote className="h-6 w-6" />
              <span className="text-xs">Cash</span>
            </Button>
            <Button
              variant={paymentMethod === "QRIS" ? "default" : "outline"}
              className="h-20 flex-col gap-2"
              onClick={() => setPaymentMethod("QRIS")}
            >
              <QrCode className="h-6 w-6" />
              <span className="text-xs">QRIS</span>
            </Button>
            <Button
              variant={paymentMethod === "CARD" ? "default" : "outline"}
              className="h-20 flex-col gap-2"
              onClick={() => setPaymentMethod("CARD")}
            >
              <CreditCard className="h-6 w-6" />
              <span className="text-xs">Card</span>
            </Button>
          </div>
        </div>

        {paymentMethod === "CASH" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-bold">Amount Paid</p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">Rp</span>
                <Input
                  type="number"
                  className="pl-10 text-xl font-bold h-12"
                  placeholder="0"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {[10000, 20000, 50000, 100000].map((val) => (
                <Button
                  key={val}
                  variant="outline"
                  size="sm"
                  className="text-[10px]"
                  onClick={() => setAmountPaid((Number(amountPaid) + val).toString())}
                >
                  +{formatCurrency(val)}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="text-[10px]"
                onClick={() => setAmountPaid(total.toString())}
              >
                Exact Amount
              </Button>
            </div>

            <div className="p-4 rounded-lg border-2 border-dashed border-primary/20 bg-primary/5 flex justify-between items-center">
              <span className="text-sm font-bold">Change</span>
              <span className="text-xl font-bold text-primary">{formatCurrency(change)}</span>
            </div>
          </div>
        )}

        {(paymentMethod === "QRIS" || paymentMethod === "CARD") && (
          <div className="p-8 rounded-lg border-2 border-dashed border-muted flex flex-col items-center justify-center space-y-4">
             {paymentMethod === "QRIS" ? <QrCode className="h-20 w-20 opacity-20" /> : <CreditCard className="h-20 w-20 opacity-20" />}
             <p className="text-sm text-muted-foreground text-center italic">
               Processing {paymentMethod} payment... 
               <br />Please follow terminal instructions.
             </p>
          </div>
        )}
      </div>
    </Dialog>
  );
}
