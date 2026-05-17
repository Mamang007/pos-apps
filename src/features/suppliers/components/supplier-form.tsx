"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type Supplier, type SupplierInput } from "../types";
import { createSupplier, updateSupplier } from "../services/actions";

interface SupplierFormProps {
  initialData?: Supplier | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function SupplierForm({ initialData, onSuccess, onCancel }: SupplierFormProps) {
  const [code, setCode] = useState(initialData?.code || "");
  const [name, setName] = useState(initialData?.name || "");
  const [contactName, setContactName] = useState(initialData?.contactName || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [address, setAddress] = useState(initialData?.address || "");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data: SupplierInput = { 
      code,
      name, 
      contactName: contactName || null,
      phone: phone || null,
      email: email || null,
      address: address || null,
    };

    try {
      let result;
      if (initialData) {
        result = await updateSupplier(initialData.id, data);
      } else {
        result = await createSupplier(data);
      }

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Failed to save supplier");
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
        <div>
          <label className="text-sm font-medium text-foreground">Supplier Code</label>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. CSN"
            required
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Supplier Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. CV. Satria Niaga"
            required
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Contact Name</label>
          <Input
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="e.g. Idris"
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Phone Number</label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 0812..."
            className="mt-1"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium text-foreground">Email Address</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. supplier@example.com"
            className="mt-1"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium text-foreground">Address</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Supplier address..."
            className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
          {loading ? "Saving..." : initialData ? "Update Supplier" : "Create Supplier"}
        </Button>
      </div>
    </form>
  );
}
