"use client";

import { useEffect, useState } from "react";
import { Package, Plus, Pencil, Trash2, Search, Barcode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type ProductWithCategory } from "../types";
import { getProducts, deleteProduct } from "../services/actions";
import { getCategories } from "../../categories/services/actions";
import { type Category } from "../../categories/types";
import { ProductForm } from "./product-form";
import { Dialog } from "@/components/ui/dialog";

export function ProductList() {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithCategory | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Delete confirmation state
  const [isDeleteDialogOpen, setIsDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [productData, categoryData] = await Promise.all([
      getProducts(),
      getCategories()
    ]);
    setProducts(productData);
    setCategories(categoryData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteClick = (id: string) => {
    setProductToDelete(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteProduct(productToDelete);
      if (result.success) {
        fetchData();
        setIsDeleteOpen(false);
        setProductToDelete(null);
      } else {
        alert(result.error);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (product: ProductWithCategory) => {
    setEditingProduct(product);
    setIsOpen(true);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    (p.barcode && p.barcode.toLowerCase().includes(search.toLowerCase()))
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
      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
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
              {isDeleting ? "Deleting..." : "Delete Product"}
            </Button>
          </>
        }
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" />
            Product Catalog
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage your inventory and product details.
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add New Product
        </Button>
      </div>

      {isFormOpen ? (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm max-w-3xl mx-auto">
          <h3 className="text-lg font-semibold mb-6">
            {editingProduct ? "Edit Product" : "Create New Product"}
          </h3>
          <ProductForm
            initialData={editingProduct}
            categories={categories}
            onSuccess={() => {
              setIsOpen(false);
              setEditingProduct(null);
              fetchData();
            }}
            onCancel={() => {
              setIsOpen(false);
              setEditingProduct(null);
            }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, SKU, or barcode..."
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
                    <th className="px-6 py-4 font-semibold text-foreground">Product</th>
                    <th className="px-6 py-4 font-semibold text-foreground">Category</th>
                    <th className="px-6 py-4 font-semibold text-foreground">UOM</th>
                    <th className="px-6 py-4 font-semibold text-foreground">Pricing</th>
                    <th className="px-6 py-4 font-semibold text-foreground">Stock</th>
                    <th className="px-6 py-4 font-semibold text-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground italic">
                        Loading products...
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground italic">
                        {search ? `No products matching "${search}"` : "No products found."}
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-accent/5 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-foreground">{product.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono">
                                {product.sku}
                              </span>
                              {product.barcode && (
                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <Barcode className="h-3 w-3" />
                                  {product.barcode}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {product.category ? (
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                              {product.category.name}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs italic">Uncategorized</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-foreground">
                          {product.uom}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Cost: {formatCurrency(product.costPrice)}</p>
                            <p className="font-semibold text-foreground">Sell: {formatCurrency(product.sellPrice)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-foreground">
                           <span className={Number(product.minStockLevel) > 0 ? "text-amber-600 dark:text-amber-400 font-medium" : ""}>
                             Min: {product.minStockLevel}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(product)}
                              title="Edit Product"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(product.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Delete Product"
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
