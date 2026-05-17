"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type Discount, type DiscountInput } from "../types";
import { createDiscount, updateDiscount } from "../services/actions";

interface DiscountFormProps {
  initialData?: Discount | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function DiscountForm({ initialData, onSuccess, onCancel }: DiscountFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED">(initialData?.type as any || "PERCENTAGE");
  const [value, setValue] = useState(initialData?.value?.toString() || "");
  const [minPurchase, setMinPurchase] = useState(initialData?.minPurchase?.toString() || "0");
  const [maxDiscount, setMaxDiscount] = useState(initialData?.maxDiscount?.toString() || "");
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data: DiscountInput = { 
      name, 
      type, 
      value,
      minPurchase,
      maxDiscount: maxDiscount || null,
      isActive,
    };

    try {
      let result;
      if (initialData) {
        result = await updateDiscount(initialData.id, data);
      } else {
        result = await createDiscount(data);
      }

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Failed to save discount rule");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-foreground">Rule Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ramadan Sale 10%"
            required
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FIXED">Fixed Amount (IDR)</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Value {type === "PERCENTAGE" ? "(%)" : "(IDR)"}</label>
          <Input
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0.00"
            required
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Min Purchase (IDR)</label>
          <Input
            type="number"
            step="0.01"
            value={minPurchase}
            onChange={(e) => setMinPurchase(e.target.value)}
            placeholder="0.00"
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Max Discount (Optional IDR)</label>
          <Input
            type="number"
            step="0.01"
            value={maxDiscount}
            onChange={(e) => setMaxDiscount(e.target.value)}
            placeholder="No limit"
            className="mt-1"
          />
        </div>

        <div className="md:col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-foreground">
            Active Rule
          </label>
        </div>
      </div>

      {error && (
        <div className="text-sm font-medium text-destructive">{error}</div>
      )}

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? "Saving..." : initialData ? "Update Rule" : "Create Rule"}
        </Button>
      </div>
    </form>
  );
}
