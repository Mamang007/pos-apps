"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Plus, Eye, Search, Calendar, User, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type POWithDetails, type POStatus } from "../types";
import { getPurchaseOrders } from "../services/actions";
import { format } from "date-fns";

interface POListProps {
  onAddPO: () => void;
  onViewPO: (po: POWithDetails) => void;
}

export function POList({ onAddPO, onViewPO }: POListProps) {
  const [purchaseOrders, setPurchaseOrders] = useState<POWithDetails[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const data = await getPurchaseOrders();
    setPurchaseOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredPOs = purchaseOrders.filter(
    (po) =>
      po.supplier.name.toLowerCase().includes(search.toLowerCase()) ||
      po.status.toLowerCase().includes(search.toLowerCase()) ||
      po.id.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(value));
  };

  const getStatusColor = (status: POStatus) => {
    switch (status) {
      case "REQUEST":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200";
      case "ON PROCESS":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200";
      case "RECEIVED":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200";
      case "CANCELLED":
        return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-primary" />
            Purchase Orders
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage procurement requests and stock intake.
          </p>
        </div>
        <Button onClick={onAddPO} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Create New PO
        </Button>
      </div>

      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by supplier, status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold text-foreground">Order Date</th>
                  <th className="px-6 py-4 font-semibold text-foreground">Supplier</th>
                  <th className="px-6 py-4 font-semibold text-foreground">Status</th>
                  <th className="px-6 py-4 font-semibold text-foreground">Total Amount</th>
                  <th className="px-6 py-4 font-semibold text-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground italic">
                      Loading purchase orders...
                    </td>
                  </tr>
                ) : filteredPOs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground italic">
                      {search ? `No purchase orders matching "${search}"` : "No purchase orders found."}
                    </td>
                  </tr>
                ) : (
                  filteredPOs.map((po) => (
                    <tr key={po.id} className="hover:bg-accent/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">{format(new Date(po.orderDate), "dd MMM yyyy HH:mm")}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">{po.supplier.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusColor(po.status as POStatus)}`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground">
                        {formatCurrency(po.totalAmount)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onViewPO(po)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
