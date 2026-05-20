"use client";

import { useState } from "react";
import { ArrowLeft, Printer, CheckCircle2, Truck, RefreshCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type POWithDetails, type POStatus } from "../types";
import { updatePOStatus } from "../services/actions";
import { format } from "date-fns";

interface PODetailProps {
  po: POWithDetails;
  onBack: () => void;
  onStatusUpdate: () => void;
}

export function PODetail({ po, onBack, onStatusUpdate }: PODetailProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateStatus = async (newStatus: POStatus) => {
    if (newStatus === "RECEIVED") {
      if (!confirm("Are you sure you want to mark this PO as RECEIVED? This will increase product stocks.")) {
        return;
      }
    }

    setIsUpdating(true);
    try {
      const result = await updatePOStatus(po.id, newStatus);
      if (result.success) {
        onStatusUpdate();
      } else {
        alert(result.error);
      }
    } finally {
      setIsUpdating(false);
    }
  };

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
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="-ml-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Print PO
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-border">
              <div>
                <h3 className="text-xl font-bold text-foreground">Purchase Order Details</h3>
                <p className="text-sm text-muted-foreground mt-1 font-mono">{po.id}</p>
              </div>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold border ${getStatusColor(po.status as POStatus)}`}>
                {po.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Supplier Information</h4>
                <p className="font-bold text-lg text-foreground">{po.supplier.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{po.supplier.address || "No address provided"}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-foreground">
                  <span className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">{po.supplier.code}</span>
                  <span>{po.supplier.phone}</span>
                </div>
              </div>
              <div className="sm:text-right">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Order Summary</h4>
                <p className="text-sm text-muted-foreground">Order Date</p>
                <p className="font-medium text-foreground mb-3">{format(new Date(po.orderDate), "dd MMMM yyyy HH:mm")}</p>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(po.totalAmount)}</p>
              </div>
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-foreground">Product</th>
                    <th className="px-4 py-3 font-semibold text-foreground text-center w-24">Qty</th>
                    <th className="px-4 py-3 font-semibold text-foreground text-right w-32">Unit Cost</th>
                    <th className="px-4 py-3 font-semibold text-foreground text-right w-32">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {po.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{item.product.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{item.product.sku}</p>
                      </td>
                      <td className="px-4 py-3 text-center text-foreground">{item.quantity} {item.product.uom}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{formatCurrency(item.unitCost)}</td>
                      <td className="px-4 py-3 text-right font-medium text-foreground">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h4 className="font-bold text-foreground mb-6 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Status Management
            </h4>
            
            <div className="space-y-3">
              {po.status === "REQUEST" && (
                <Button 
                  className="w-full justify-start h-12" 
                  variant="outline"
                  onClick={() => handleUpdateStatus("ON PROCESS")}
                  disabled={isUpdating}
                >
                  <RefreshCcw className="mr-3 h-5 w-5 text-amber-500" />
                  Mark as On Process
                </Button>
              )}
              
              {(po.status === "REQUEST" || po.status === "ON PROCESS") && (
                <Button 
                  className="w-full justify-start h-12 bg-emerald-600 hover:bg-emerald-700 text-white" 
                  onClick={() => handleUpdateStatus("RECEIVED")}
                  disabled={isUpdating}
                >
                  <Truck className="mr-3 h-5 w-5" />
                  Mark as Received
                </Button>
              )}

              {(po.status === "REQUEST" || po.status === "ON PROCESS") && (
                <div className="pt-4 border-t border-border mt-4">
                  <Button 
                    className="w-full justify-start h-12 text-destructive hover:bg-destructive/10 hover:text-destructive" 
                    variant="ghost"
                    onClick={() => handleUpdateStatus("CANCELLED")}
                    disabled={isUpdating}
                  >
                    <XCircle className="mr-3 h-5 w-5" />
                    Cancel Order
                  </Button>
                </div>
              )}

              {po.status === "RECEIVED" && (
                <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <p>This order has been received and stock levels have been updated. No further changes can be made.</p>
                </div>
              )}

              {po.status === "CANCELLED" && (
                <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-sm flex items-start gap-3">
                  <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <p>This order has been cancelled.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
