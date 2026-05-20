"use client";

import { useEffect, useState } from "react";
import { 
  Package, 
  Search, 
  ArrowRightLeft, 
  History, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  User,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type StockWithDetails, type StockMovementWithDetails } from "../types";
import { getStocks, getStockMovements } from "../services/actions";
import { AdjustmentModal } from "./AdjustmentModal";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function InventoryManagement() {
  const [stocks, setStocks] = useState<StockWithDetails[]>([]);
  const [movements, setMovements] = useState<StockMovementWithDetails[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"STOCK" | "HISTORY">("STOCK");
  const [selectedStock, setSelectedStock] = useState<StockWithDetails | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [stockData, movementData] = await Promise.all([
      getStocks(),
      getStockMovements()
    ]);
    setStocks(stockData);
    setMovements(movementData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredStocks = stocks.filter(
    (s) =>
      s.product.name.toLowerCase().includes(search.toLowerCase()) ||
      s.product.sku.toLowerCase().includes(search.toLowerCase())
  );

  const filteredMovements = movements.filter(
    (m) =>
      m.product.name.toLowerCase().includes(search.toLowerCase()) ||
      m.product.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" />
            Inventory Management
          </h2>
          <p className="text-muted-foreground mt-1">Track physical stock levels and movement history.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between border-b border-border pb-px">
        <div className="flex gap-4">
           <button
             className={cn(
               "pb-4 text-sm font-bold transition-colors relative",
               activeTab === "STOCK" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
             )}
             onClick={() => setActiveTab("STOCK")}
           >
             Current Stock
           </button>
           <button
             className={cn(
               "pb-4 text-sm font-bold transition-colors relative",
               activeTab === "HISTORY" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
             )}
             onClick={() => setActiveTab("HISTORY")}
           >
             Movement History
           </button>
        </div>
        <div className="relative max-w-sm w-full mb-4 sm:mb-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {activeTab === "STOCK" ? (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold text-foreground">Product</th>
                  <th className="px-6 py-4 font-semibold text-foreground">Category</th>
                  <th className="px-6 py-4 font-semibold text-foreground text-center">In Stock</th>
                  <th className="px-6 py-4 font-semibold text-foreground text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground italic">Loading...</td></tr>
                ) : filteredStocks.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground italic">No products found.</td></tr>
                ) : (
                  filteredStocks.map((stock) => {
                    const isLow = stock.quantity <= stock.product.minStockLevel;
                    return (
                      <tr key={stock.id} className="hover:bg-accent/5 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-foreground">{stock.product.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{stock.product.sku}</p>
                        </td>
                        <td className="px-6 py-4">
                           <span className="text-muted-foreground">{stock.product.category?.name || "Uncategorized"}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={cn("font-bold text-lg", isLow ? "text-rose-500" : "text-foreground")}>
                             {stock.quantity}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">{stock.product.uom}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                           {isLow ? (
                             <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                               <AlertTriangle className="h-3 w-3" /> LOW STOCK
                             </span>
                           ) : (
                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                               HEALTHY
                             </span>
                           )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="outline" size="sm" onClick={() => setSelectedStock(stock)}>
                            <ArrowRightLeft className="mr-2 h-3.5 w-3.5" /> Adjust
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold text-foreground">Date</th>
                  <th className="px-6 py-4 font-semibold text-foreground">Product</th>
                  <th className="px-6 py-4 font-semibold text-foreground text-center">Change</th>
                  <th className="px-6 py-4 font-semibold text-foreground">Type</th>
                  <th className="px-6 py-4 font-semibold text-foreground">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground italic">Loading...</td></tr>
                ) : filteredMovements.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground italic">No movements recorded.</td></tr>
                ) : (
                  filteredMovements.map((m) => (
                    <tr key={m.id} className="hover:bg-accent/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{format(new Date(m.createdAt), "dd MMM HH:mm")}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground">{m.product.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{m.product.sku}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className={cn(
                          "inline-flex items-center gap-1 font-bold",
                          m.changeQuantity > 0 ? "text-emerald-500" : "text-rose-500"
                        )}>
                          {m.changeQuantity > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {m.changeQuantity > 0 ? `+${m.changeQuantity}` : m.changeQuantity}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-muted px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                          {m.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                              {m.user.name?.charAt(0)}
                           </div>
                           <span className="text-xs">{m.user.name}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedStock && (
        <AdjustmentModal
          stock={selectedStock}
          isOpen={!!selectedStock}
          onClose={() => setSelectedStock(null)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
