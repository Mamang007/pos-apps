"use client";

import { useState } from "react";
import { Plus, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type Supplier } from "../../suppliers/types";
import { type Product } from "../../products/types";
import { createPO } from "../services/actions";

interface POFormProps {
  suppliers: Supplier[];
  products: Product[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function POForm({ suppliers, products, onSuccess, onCancel }: POFormProps) {
  const [supplierId, setSupplierId] = useState("");
  const [items, setItems] = useState<{ productId: string; quantity: number; unitCost: number }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addItem = () => {
    setItems([...items, { productId: "", quantity: 1, unitCost: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    if (field === "productId") {
      newItems[index].productId = value;
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index].unitCost = Number(product.costPrice);
      }
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((acc, item) => acc + item.quantity * item.unitCost, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || items.length === 0) {
      alert("Please select a supplier and add at least one item.");
      return;
    }

    if (items.some(item => !item.productId || item.quantity <= 0)) {
      alert("Please fill in all item details correctly.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createPO({ supplierId, items });
      if (result.success) {
        onSuccess();
      } else {
        alert(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Supplier</label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            required
          >
            <option value="">Select a supplier</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Order Items</h4>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-semibold text-foreground">Product</th>
                <th className="px-4 py-3 font-semibold text-foreground w-24">Qty</th>
                <th className="px-4 py-3 font-semibold text-foreground w-40">Unit Cost</th>
                <th className="px-4 py-3 font-semibold text-foreground w-40">Subtotal</th>
                <th className="px-4 py-3 font-semibold text-foreground text-right w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground italic">
                    No items added yet.
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2">
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={item.productId}
                        onChange={(e) => updateItem(index, "productId", e.target.value)}
                        required
                      >
                        <option value="">Select product</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 0)}
                        className="h-9"
                        required
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        min="0"
                        value={item.unitCost}
                        onChange={(e) => updateItem(index, "unitCost", parseFloat(e.target.value) || 0)}
                        className="h-9"
                        required
                      />
                    </td>
                    <td className="px-4 py-2 font-medium text-foreground">
                      {formatCurrency(item.quantity * item.unitCost)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-muted/50 border-t border-border">
              <tr>
                <td colSpan={3} className="px-4 py-4 text-right font-semibold text-foreground uppercase tracking-wider">
                  Total Amount
                </td>
                <td colSpan={2} className="px-4 py-4 font-bold text-lg text-primary">
                  {formatCurrency(calculateTotal())}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "Creating..." : "Create Purchase Order"}
        </Button>
      </div>
    </form>
  );
}
