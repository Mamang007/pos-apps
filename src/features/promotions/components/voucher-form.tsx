"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type Discount, type VoucherInput } from "../types";
import { createVoucher } from "../services/actions";

interface VoucherFormProps {
  discounts: Discount[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function VoucherForm({ discounts, onSuccess, onCancel }: VoucherFormProps) {
  const [code, setCode] = useState("");
  const [discountId, setDiscountId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data: VoucherInput = { code, discountId };

    try {
      const result = await createVoucher(data);
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Failed to create voucher");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground">Discount Rule</label>
          <select
            value={discountId}
            onChange={(e) => setDiscountId(e.target.value)}
            required
            className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" disabled>Select a rule</option>
            {discounts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.type === "PERCENTAGE" ? `${d.value}%` : `IDR ${d.value}`})
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Voucher Code</label>
            <button
              type="button"
              onClick={generateRandomCode}
              className="text-xs text-primary hover:underline"
            >
              Generate Random
            </button>
          </div>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. RAMADAN10"
            required
            className="mt-1 font-mono uppercase"
          />
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
          {loading ? "Generating..." : "Create Voucher"}
        </Button>
      </div>
    </form>
  );
}
