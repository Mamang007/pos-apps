"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type Category } from "../../categories/types";
import { type ProductInput, type ProductWithCategory } from "../types";
import { createProduct, updateProduct } from "../services/actions";

interface ProductFormProps {
  initialData?: ProductWithCategory | null;
  categories: Category[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({ initialData, categories, onSuccess, onCancel }: ProductFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [sku, setSku] = useState(initialData?.sku || "");
  const [barcode, setBarcode] = useState(initialData?.barcode || "");
  const [uom, setUom] = useState(initialData?.uom || "Pcs");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [costPrice, setCostPrice] = useState(initialData?.costPrice?.toString() || "");
  const [sellPrice, setSellPrice] = useState(initialData?.sellPrice?.toString() || "");
  const [minStockLevel, setMinStockLevel] = useState(initialData?.minStockLevel || 0);
  const [description, setDescription] = useState(initialData?.description || "");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data: ProductInput = { 
      name, 
      sku, 
      barcode: barcode || null,
      uom,
      categoryId: categoryId || null,
      costPrice,
      sellPrice,
      minStockLevel: Number(minStockLevel),
      description: description || null,
    };

    try {
      let result;
      if (initialData) {
        result = await updateProduct(initialData.id, data);
      } else {
        result = await createProduct(data);
      }

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Failed to save product");
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
          <label className="text-sm font-medium text-foreground">Product Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Indomie Ayam Bawang"
            required
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">SKU (Unique Code)</label>
          <Input
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="e.g. IND-001"
            required
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Barcode</label>
          <Input
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="e.g. 899..."
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" disabled>Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">UOM (Unit of Measure)</label>
          <Input
            value={uom}
            onChange={(e) => setUom(e.target.value)}
            placeholder="e.g. Pcs, Box, Pack"
            required
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Cost Price</label>
          <Input
            type="number"
            step="0.01"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            placeholder="0.00"
            required
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Sell Price</label>
          <Input
            type="number"
            step="0.01"
            value={sellPrice}
            onChange={(e) => setSellPrice(e.target.value)}
            placeholder="0.00"
            required
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Min Stock Level</label>
          <Input
            type="number"
            value={minStockLevel}
            onChange={(e) => setMinStockLevel(Number(e.target.value))}
            placeholder="0"
            required
            className="mt-1"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium text-foreground">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional product description..."
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
          {loading ? "Saving..." : initialData ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
