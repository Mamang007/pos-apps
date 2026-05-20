"use client";

import { useState } from "react";
import { Plus, Minus, X, Save, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { adjustStock } from "../services/actions";
import { type StockWithDetails } from "../types";

interface AdjustmentModalProps {
  stock: StockWithDetails;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdjustmentModal({ stock, isOpen, onClose, onSuccess }: AdjustmentModalProps) {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"ADD" | "REMOVE">("ADD");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const val = parseInt(amount);
    if (isNaN(val) || val <= 0) {
      alert("Please enter a valid positive number.");
      return;
    }

    if (type === "REMOVE" && val > stock.quantity) {
      alert("Removal quantity cannot exceed current stock.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await adjustStock({
        productId: stock.productId,
        changeQuantity: type === "ADD" ? val : -val,
        type: "ADJUSTMENT",
      });

      if ("success" in result && result.success) {
        onSuccess();
        onClose();
      } else {
        alert("error" in result ? result.error : "Adjustment failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose}
      title="Stock Adjustment"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            Apply Adjustment
          </Button>
        </>
      }
    >
      <div className="space-y-6 py-4">
        <div className="bg-muted/50 p-4 rounded-xl space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Product</p>
          <p className="font-bold text-lg">{stock.product.name}</p>
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
              Current Stock: {stock.quantity} {stock.product.uom}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-bold">Adjustment Type</p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={type === "ADD" ? "default" : "outline"}
              className="h-12 gap-2"
              onClick={() => setType("ADD")}
            >
              <Plus className="h-4 w-4" />
              Add Stock
            </Button>
            <Button
              variant={type === "REMOVE" ? "default" : "outline"}
              className="h-12 gap-2"
              onClick={() => setType("REMOVE")}
            >
              <Minus className="h-4 w-4" />
              Remove Stock
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-bold">Quantity Change</p>
          <div className="relative">
            <Input
              type="number"
              className="text-xl font-bold h-12"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">
              {stock.product.uom}
            </span>
          </div>
        </div>

        {type === "REMOVE" && (
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-lg flex gap-3 text-xs border border-rose-500/20">
             <AlertTriangle className="h-4 w-4 shrink-0" />
             <p>This will permanently decrease the physical inventory level.</p>
          </div>
        )}
      </div>
    </Dialog>
  );
}
