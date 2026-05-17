"use client";

import { useEffect, useState } from "react";
import { Truck, Plus, Pencil, Trash2, Search, User, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type Supplier } from "../types";
import { getSuppliers, deleteSupplier } from "../services/actions";
import { SupplierForm } from "./supplier-form";
import { Dialog } from "@/components/ui/dialog";

export function SupplierList() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Delete confirmation state
  const [isDeleteDialogOpen, setIsDeleteOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSuppliers = async () => {
    setLoading(true);
    const data = await getSuppliers();
    setSuppliers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleDeleteClick = (id: string) => {
    setSupplierToDelete(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!supplierToDelete) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteSupplier(supplierToDelete);
      if (result.success) {
        fetchSuppliers();
        setIsDeleteOpen(false);
        setSupplierToDelete(null);
      } else {
        alert(result.error);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsOpen(true);
  };

  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase()) ||
    (s.contactName && s.contactName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Supplier"
        description="Are you sure you want to delete this supplier? This action cannot be undone."
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
              {isDeleting ? "Deleting..." : "Delete Supplier"}
            </Button>
          </>
        }
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Truck className="h-8 w-8 text-primary" />
            Suppliers
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage your vendor directory and contact information.
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add New Supplier
        </Button>
      </div>

      {isFormOpen ? (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm max-w-3xl mx-auto">
          <h3 className="text-lg font-semibold mb-6">
            {editingSupplier ? "Edit Supplier" : "Create New Supplier"}
          </h3>
          <SupplierForm
            initialData={editingSupplier}
            onSuccess={() => {
              setIsOpen(false);
              setEditingSupplier(null);
              fetchSuppliers();
            }}
            onCancel={() => {
              setIsOpen(false);
              setEditingSupplier(null);
            }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, code, or contact..."
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
                    <th className="px-6 py-4 font-semibold text-foreground">Supplier</th>
                    <th className="px-6 py-4 font-semibold text-foreground">Contact</th>
                    <th className="px-6 py-4 font-semibold text-foreground">Phone/Email</th>
                    <th className="px-6 py-4 font-semibold text-foreground">Address</th>
                    <th className="px-6 py-4 font-semibold text-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground italic">
                        Loading suppliers...
                      </td>
                    </tr>
                  ) : filteredSuppliers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground italic">
                        {search ? `No suppliers matching "${search}"` : "No suppliers found."}
                      </td>
                    </tr>
                  ) : (
                    filteredSuppliers.map((supplier) => (
                      <tr key={supplier.id} className="hover:bg-accent/5 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-foreground">{supplier.name}</p>
                            <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono">
                              {supplier.code}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-foreground">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-muted-foreground" />
                            {supplier.contactName || <span className="text-xs italic text-muted-foreground">No contact</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {supplier.phone && (
                              <div className="flex items-center gap-2 text-xs">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                {supplier.phone}
                              </div>
                            )}
                            {supplier.email && (
                              <div className="flex items-center gap-2 text-xs">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                {supplier.email}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-foreground max-w-[200px] truncate">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="truncate" title={supplier.address || ""}>
                              {supplier.address || <span className="text-xs italic text-muted-foreground">No address</span>}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(supplier)}
                              title="Edit Supplier"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(supplier.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Delete Supplier"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
