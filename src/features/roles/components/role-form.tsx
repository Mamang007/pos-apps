"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AVAILABLE_PERMISSIONS, type Role, type RoleInput } from "../types";
import { createRole, updateRole } from "../services/actions";

interface RoleFormProps {
  initialData?: Role | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function RoleForm({ initialData, onSuccess, onCancel }: RoleFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [permissions, setPermissions] = useState<string[]>(
    (initialData?.permissions as string[]) || []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const togglePermission = (permId: string) => {
    setPermissions((prev) =>
      prev.includes(permId)
        ? prev.filter((id) => id !== permId)
        : [...prev, permId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data: RoleInput = { name, permissions };

    try {
      let result;
      if (initialData) {
        result = await updateRole(initialData.id, data);
      } else {
        result = await createRole(data);
      }

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Failed to save role");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground">Role Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Supervisor"
            required
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-3 block">
            Permissions
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-4 border border-border rounded-lg bg-muted/50">
            {AVAILABLE_PERMISSIONS.map((perm) => (
              <label
                key={perm.id}
                className="flex items-center gap-3 cursor-pointer hover:bg-accent p-2 rounded-md transition-colors"
              >
                <input
                  type="checkbox"
                  checked={permissions.includes(perm.id)}
                  onChange={() => togglePermission(perm.id)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
                />
                <span className="text-sm text-foreground">{perm.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="text-sm font-medium text-destructive">{error}</div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? "Saving..." : initialData ? "Update Role" : "Create Role"}
        </Button>
      </div>
    </form>
  );
}
