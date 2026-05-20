"use client";

import { ArrowLeft, Printer, User, Calendar, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type SalesOrderWithDetails } from "../types";
import { format } from "date-fns";

interface SalesDetailProps {
  order: SalesOrderWithDetails;
  onBack: () => void;
}

export function SalesDetail({ order, onBack }: SalesDetailProps) {
  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(value));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="-ml-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to History
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Print Receipt
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-border">
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  Sales Order Details
                </h3>
              </div>
              <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold border bg-emerald-100/30 text-emerald-700 dark:text-emerald-400 border-emerald-200">
                {order.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                  <User className="h-3 w-3" /> Customer Information
                </h4>
                <p className="font-bold text-lg text-foreground">
                  {order.customer?.name || "Cash Customer"}
                </p>
                {order.customer && (
                  <>
                    <p className="text-sm text-muted-foreground mt-1">
                      {order.customer.address || "No address provided"}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-foreground">
                      <span>{order.customer.phone}</span>
                    </div>
                  </>
                )}
              </div>
              <div className="sm:text-right">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center sm:justify-end gap-2">
                  <Calendar className="h-3 w-3" /> Transaction Summary
                </h4>
                <p className="text-sm text-muted-foreground">Sale Date</p>
                <p className="font-medium text-foreground mb-3">
                  {format(new Date(order.saleDate), "dd MMMM yyyy HH:mm")}
                </p>
                <p className="text-sm text-muted-foreground">Cashier</p>
                <p className="font-medium text-foreground">{order.user.name}</p>
              </div>
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-foreground">
                      Product
                    </th>
                    <th className="px-4 py-3 font-semibold text-foreground text-center w-24">
                      Qty
                    </th>
                    <th className="px-4 py-3 font-semibold text-foreground text-right w-32">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 font-semibold text-foreground text-right w-32">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">
                          {item.product.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {item.product.sku}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center text-foreground">
                        {item.quantity} {item.product.uom}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-foreground">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h4 className="font-bold text-foreground mb-6 flex items-center gap-2 border-b pb-4 border-border">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Summary
            </h4>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (11%)</span>
                  <span className="font-medium">
                    {formatCurrency(order.taxAmount)}
                  </span>
                </div>
                {Number(order.discountAmount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600 font-medium">
                      Discount
                    </span>
                    <span className="text-emerald-600 font-medium">
                      -{formatCurrency(order.discountAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2 border-border mt-2">
                  <span>Total</span>
                  <span className="text-primary">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Payment History
                </p>
                {order.payments.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 rounded-lg bg-muted/50 border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-bold">{p.paymentMethod}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {format(new Date(p.createdAt), "HH:mm")}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-sm">
                      {formatCurrency(p.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
