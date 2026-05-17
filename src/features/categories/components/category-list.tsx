"use client";

import { useEffect, useState } from "react";
import { Tags, Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type Category } from "../types";
import { getCategories, deleteCategory } from "../services/actions";
import { CategoryForm } from "./category-form";
import { Dialog } from "@/components/ui/dialog";

export function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Delete confirmation state
  const [isDeleteDialogOpen, setIsDeleteOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    const data = await getCategories();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDeleteClick = (id: string) => {
    setCategoryToDelete(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteCategory(categoryToDelete);
      if (result.success) {
        fetchCategories();
        setIsDeleteOpen(false);
        setCategoryToDelete(null);
      } else {
        alert(result.error);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsOpen(true);
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase()) ||
    cat.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
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
              {isDeleting ? "Deleting..." : "Delete Category"}
            </Button>
          </>
        }
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Tags className="h-8 w-8 text-primary" />
            Categories
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage product categories for better organization.
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add New Category
        </Button>
      </div>

      {isFormOpen ? (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold mb-6">
            {editingCategory ? "Edit Category" : "Create New Category"}
          </h3>
          <CategoryForm
            initialData={editingCategory}
            onSuccess={() => {
              setIsOpen(false);
              setEditingCategory(null);
              fetchCategories();
            }}
            onCancel={() => {
              setIsOpen(false);
              setEditingCategory(null);
            }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
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
                    <th className="px-6 py-4 font-semibold text-foreground">Name</th>
                    <th className="px-6 py-4 font-semibold text-foreground">Description</th>
                    <th className="px-6 py-4 font-semibold text-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground italic">
                        Loading categories...
                      </td>
                    </tr>
                  ) : filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground italic">
                        {search ? `No categories matching "${search}"` : "No categories found."}
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-accent/5 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">
                          {cat.name}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {cat.description || <span className="italic text-xs">No description</span>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(cat)}
                              title="Edit Category"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(cat.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Delete Category"
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
