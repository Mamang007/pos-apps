"use client";

import { useEffect, useState } from "react";
import { UserCog, Plus, Pencil, Trash2, Search, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type UserWithRole } from "../types";
import { getUsers, deleteUser } from "../services/actions";
import { getRoles } from "../../roles/services/actions";
import { type Role } from "../../roles/types";
import { UserForm } from "./user-form";
import { Dialog } from "@/components/ui/dialog";

export function UserList() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Delete confirmation state
  const [isDeleteDialogOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [userData, roleData] = await Promise.all([
      getUsers(),
      getRoles()
    ]);
    setUsers(userData);
    setRoles(roleData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteClick = (id: string) => {
    setUserToDelete(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteUser(userToDelete);
      if (result.success) {
        fetchData();
        setIsDeleteOpen(false);
        setUserToDelete(null);
      } else {
        alert(result.error);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (user: UserWithRole) => {
    setEditingUser(user);
    setIsOpen(true);
  };

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
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
              {isDeleting ? "Deleting..." : "Delete User"}
            </Button>
          </>
        }
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <UserCog className="h-8 w-8 text-primary" />
            User Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage staff accounts and assign roles.
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add New User
        </Button>
      </div>

      {isFormOpen ? (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold mb-6">
            {editingUser ? "Edit User" : "Create New User"}
          </h3>
          <UserForm
            initialData={editingUser}
            roles={roles}
            onSuccess={() => {
              setIsOpen(false);
              setEditingUser(null);
              fetchData();
            }}
            onCancel={() => {
              setIsOpen(false);
              setEditingUser(null);
            }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
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
                    <th className="px-6 py-4 font-semibold text-foreground">User</th>
                    <th className="px-6 py-4 font-semibold text-foreground">Username</th>
                    <th className="px-6 py-4 font-semibold text-foreground">Role</th>
                    <th className="px-6 py-4 font-semibold text-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground italic">
                        Loading users...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground italic">
                        {search ? `No users matching "${search}"` : "No users found."}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-accent/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {user.name ? user.name[0].toUpperCase() : <UserIcon className="h-4 w-4" />}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-foreground">
                          {user.username}
                        </td>
                        <td className="px-6 py-4">
                          {user.role ? (
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                              {user.role.name}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs italic">No role</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(user)}
                              title="Edit User"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(user.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Delete User"
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
