"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type Role } from "../types";
import { getRoles, deleteRole } from "../services/actions";
import { RoleForm } from "./role-form";
import { Dialog } from "@/components/ui/dialog";

export function RoleList() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Delete confirmation state
  const [isDeleteDialogOpen, setIsDeleteOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRoles = async () => {
    setLoading(true);
    const data = await getRoles();
    setRoles(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleDeleteClick = (id: string) => {
    setRoleToDelete(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!roleToDelete) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteRole(roleToDelete);
      if (result.success) {
        fetchRoles();
        setIsDeleteOpen(false);
        setRoleToDelete(null);
      } else {
        alert(result.error);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setIsOpen(true);
  };

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Role"
        description="Are you sure you want to delete this role? This action cannot be undone."
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
              {isDeleting ? "Deleting..." : "Delete Role"}
            </Button>
          </>
        }
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            Roles & Permissions
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage user roles and their associated permissions.
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add New Role
        </Button>
      </div>

      {isFormOpen ? (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold mb-6">
            {editingRole ? "Edit Role" : "Create New Role"}
          </h3>
          <RoleForm
            initialData={editingRole}
            onSuccess={() => {
              setIsOpen(false);
              setEditingRole(null);
              fetchRoles();
            }}
            onCancel={() => {
              setIsOpen(false);
              setEditingRole(null);
            }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search roles..."
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
                    <th className="px-6 py-4 font-semibold text-foreground">Role Name</th>
                    <th className="px-6 py-4 font-semibold text-foreground">Permissions</th>
                    <th className="px-6 py-4 font-semibold text-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground italic">
                        Loading roles...
                      </td>
                    </tr>
                  ) : filteredRoles.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground italic">
                        {search ? `No roles matching "${search}"` : "No roles found."}
                      </td>
                    </tr>
                  ) : (
                    filteredRoles.map((role) => (
                      <tr key={role.id} className="hover:bg-accent/5 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">
                          {role.name}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {((role.permissions as string[]) || []).map((p) => (
                              <span
                                key={p}
                                className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                              >
                                {p}
                              </span>
                            ))}
                            {((role.permissions as string[]) || []).length === 0 && (
                              <span className="text-muted-foreground text-xs italic">No permissions</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(role)}
                              title="Edit Role"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(role.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Delete Role"
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
