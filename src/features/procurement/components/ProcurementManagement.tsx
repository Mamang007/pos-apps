"use client";

import { useState, useEffect } from "react";
import { POList } from "./POList";
import { POForm } from "./POForm";
import { PODetail } from "./PODetail";
import { type POWithDetails } from "../types";
import { getSuppliers } from "../../suppliers/services/actions";
import { getProducts } from "../../products/services/actions";
import { type Supplier } from "../../suppliers/types";
import { type Product } from "../../products/types";

export function ProcurementManagement() {
  const [view, setView] = useState<"list" | "form" | "detail">("list");
  const [selectedPO, setSelectedPO] = useState<POWithDetails | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchData() {
      const [sData, pData] = await Promise.all([
        getSuppliers(),
        getProducts()
      ]);
      setSuppliers(sData);
      setProducts(pData);
    }
    fetchData();
  }, []);

  const handleAddPO = () => {
    setView("form");
  };

  const handleViewPO = (po: POWithDetails) => {
    setSelectedPO(po);
    setView("detail");
  };

  const handleSuccess = () => {
    setView("list");
    setSelectedPO(null);
  };

  return (
    <div className="container mx-auto py-6">
      {view === "list" && (
        <POList onAddPO={handleAddPO} onViewPO={handleViewPO} />
      )}
      
      {view === "form" && (
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Create Purchase Order</h2>
            <p className="text-muted-foreground mt-1">Fill in the details to request new stock from a supplier.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <POForm 
              suppliers={suppliers} 
              products={products} 
              onSuccess={handleSuccess} 
              onCancel={() => setView("list")} 
            />
          </div>
        </div>
      )}

      {view === "detail" && selectedPO && (
        <PODetail 
          po={selectedPO} 
          onBack={() => {
            setView("list");
            setSelectedPO(null);
          }} 
          onStatusUpdate={handleSuccess}
        />
      )}
    </div>
  );
}
