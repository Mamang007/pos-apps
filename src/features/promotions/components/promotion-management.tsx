"use client";

import { useEffect, useState } from "react";
import { Ticket, Plus, Pencil, Trash2, Search, Percent, Banknote, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type Discount, type VoucherWithDiscount } from "../types";
import { getDiscounts, deleteDiscount, getVouchers, deleteVoucher } from "../services/actions";
import { DiscountForm } from "./discount-form";
import { VoucherForm } from "./voucher-form";
import { Dialog } from "@/components/ui/dialog";

export function PromotionManagement() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [vouchers, setVouchers] = useState<VoucherWithDiscount[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"DISCOUNTS" | "VOUCHERS">("DISCOUNTS");
  const [isFormOpen, setIsOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isDeleteDialogOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: "DISCOUNT" | "VOUCHER" } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [discountData, voucherData] = await Promise.all([
      getDiscounts(),
      getVouchers()
    ]);
    setDiscounts(discountData);
    setVouchers(voucherData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteClick = (id: string, type: "DISCOUNT" | "VOUCHER") => {
    setItemToDelete({ id, type });
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    setIsDeleting(true);
    try {
      const result = itemToDelete.type === "DISCOUNT" 
        ? await deleteDiscount(itemToDelete.id) 
        : await deleteVoucher(itemToDelete.id);
        
      if (result.success) {
        fetchData();
        setIsDeleteOpen(false);
        setItemToDelete(null);
      } else {
        alert(result.error);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount);
    setActiveTab("DISCOUNTS");
    setIsOpen(true);
  };

  const filteredDiscounts = discounts.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredVouchers = vouchers.filter((v) =>
    v.code.toLowerCase().includes(search.toLowerCase()) ||
    v.discount?.name.toLowerCase().includes(search.toLowerCase())
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
      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteOpen(false)}
        title={`Delete ${itemToDelete?.type === "DISCOUNT" ? "Rule" : "Voucher"}`}
        description="Are you sure? This action cannot be undone."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button 
              variant="default" 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90" 
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </>
        }
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Ticket className="h-8 w-8 text-primary" />
            Discounts & Vouchers
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage promotional rules and voucher codes.
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {activeTab === "DISCOUNTS" ? "New Rule" : "New Voucher"}
        </Button>
      </div>

      <div className="flex gap-4 border-b border-border">
        <button
          onClick={() => setActiveTab("DISCOUNTS")}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "DISCOUNTS" 
              ? "border-primary text-foreground" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Discount Rules
        </button>
        <button
          onClick={() => setActiveTab("VOUCHERS")}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "VOUCHERS" 
              ? "border-primary text-foreground" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Voucher Codes
        </button>
      </div>

      {isFormOpen ? (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold mb-6">
            {activeTab === "DISCOUNTS" 
              ? (editingDiscount ? "Edit Discount Rule" : "Create New Rule")
              : "Create New Voucher"}
          </h3>
          {activeTab === "DISCOUNTS" ? (
            <DiscountForm
              initialData={editingDiscount}
              onSuccess={() => {
                setIsOpen(false);
                setEditingDiscount(null);
                fetchData();
              }}
              onCancel={() => {
                setIsOpen(false);
                setEditingDiscount(null);
              }}
            />
          ) : (
            <VoucherForm
              discounts={discounts}
              onSuccess={() => {
                setIsOpen(false);
                fetchData();
              }}
              onCancel={() => setIsOpen(false)}
            />
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={activeTab === "DISCOUNTS" ? "Search rules..." : "Search vouchers..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  {activeTab === "DISCOUNTS" ? (
                    <tr>
                      <th className="px-6 py-4 font-semibold text-foreground">Rule Name</th>
                      <th className="px-6 py-4 font-semibold text-foreground">Value</th>
                      <th className="px-6 py-4 font-semibold text-foreground">Conditions</th>
                      <th className="px-6 py-4 font-semibold text-foreground">Status</th>
                      <th className="px-6 py-4 font-semibold text-foreground text-right">Actions</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="px-6 py-4 font-semibold text-foreground">Voucher Code</th>
                      <th className="px-6 py-4 font-semibold text-foreground">Associated Rule</th>
                      <th className="px-6 py-4 font-semibold text-foreground">Usage</th>
                      <th className="px-6 py-4 font-semibold text-foreground text-right">Actions</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground italic">
                        Loading...
                      </td>
                    </tr>
                  ) : (activeTab === "DISCOUNTS" ? filteredDiscounts : filteredVouchers).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground italic">
                        No items found.
                      </td>
                    </tr>
                  ) : activeTab === "DISCOUNTS" ? (
                    filteredDiscounts.map((discount) => (
                      <tr key={discount.id} className="hover:bg-accent/5 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">
                          {discount.name}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {discount.type === "PERCENTAGE" ? (
                              <Percent className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Banknote className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="font-semibold text-foreground">
                              {discount.type === "PERCENTAGE" ? `${discount.value}%` : formatCurrency(discount.value)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="text-xs space-y-1">
                             <p className="text-muted-foreground">Min: {formatCurrency(discount.minPurchase)}</p>
                             {discount.maxDiscount && (
                               <p className="text-muted-foreground">Max: {formatCurrency(discount.maxDiscount)}</p>
                             )}
                           </div>
                        </td>
                        <td className="px-6 py-4">
                          {discount.isActive ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                              <CheckCircle2 className="h-3 w-3" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
                              <XCircle className="h-3 w-3" />
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(discount)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(discount.id, "DISCOUNT")}
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    filteredVouchers.map((voucher) => (
                      <tr key={voucher.id} className="hover:bg-accent/5 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-foreground tracking-wider">
                          {voucher.code}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-foreground">{voucher.discount?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {voucher.discount?.type === "PERCENTAGE" ? `${voucher.discount?.value}%` : formatCurrency(voucher.discount?.value || 0)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {voucher.isUsed ? (
                            <div className="text-xs">
                              <span className="text-red-500 font-medium">Used</span>
                              <p className="text-muted-foreground">{new Date(voucher.usedAt!).toLocaleDateString()}</p>
                            </div>
                          ) : (
                            <span className="text-xs text-green-500 font-medium">Available</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(voucher.id, "VOUCHER")}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
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
      )}
    </div>
  );
}
