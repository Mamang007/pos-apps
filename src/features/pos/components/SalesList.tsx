"use client";

import { useEffect, useState } from "react";
import { Eye, Search, Calendar, User, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type SalesOrderWithDetails } from "../types";
import { getSalesOrders } from "../services/actions";
import { format } from "date-fns";

interface SalesListProps {
  onViewOrder: (order: SalesOrderWithDetails) => void;
}

export function SalesList({ onViewOrder }: SalesListProps) {
  const [orders, setOrders] = useState<SalesOrderWithDetails[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const data = await getSalesOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredOrders = orders.filter(
    (order) =>
      (order.customer?.name || "Cash Customer").toLowerCase().includes(search.toLowerCase()) ||
      order.id.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(value));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sales History</h2>
          <p className="text-muted-foreground">View and manage past customer transactions.</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID or customer name..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold text-foreground">Sale Date</th>
                <th className="px-6 py-4 font-semibold text-foreground">Customer</th>
                <th className="px-6 py-4 font-semibold text-foreground">Payment</th>
                <th className="px-6 py-4 font-semibold text-foreground text-right">Total Amount</th>
                <th className="px-6 py-4 font-semibold text-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground italic">
                    Loading sales orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground italic">
                    {search ? `No orders matching "${search}"` : "No transactions found."}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-accent/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{format(new Date(order.saleDate), "dd MMM yyyy HH:mm")}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">
                          {order.customer?.name || "Cash Customer"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-col">
                        {order.payments.map((p, idx) => (
                           <div key={idx} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                             <CreditCard className="h-3 w-3" />
                             <span>{p.paymentMethod}</span>
                           </div>
                        ))}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-primary">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => onViewOrder(order)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Details
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
  );
}
