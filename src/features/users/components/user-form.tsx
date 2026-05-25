"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type Role } from "../../roles/types";
import { type UserInput, type UserWithRole } from "../types";
import { createUser, updateUser } from "../services/actions";

interface UserFormProps {
  initialData?: UserWithRole | null;
  roles: Role[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function UserForm({
  initialData,
  roles,
  onSuccess,
  onCancel,
}: UserFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [username, setUsername] = useState(initialData?.username || "");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(initialData?.roleId || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data: UserInput = {
      name,
      email,
      username,
      password: password || undefined,
      roleId,
    };

    try {
      let result;
      if (initialData) {
        result = await updateUser(initialData.id, data);
      } else {
        result = await createUser(data);
      }

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Failed to save user");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground">
            Full Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Yudhy"
            required
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">
            Email Address
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="yudhy@example.com"
            required
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">
            Username
          </label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="yudhy"
            required
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">
            {initialData
              ? "Password (leave blank to keep current)"
              : "Password"}
          </label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required={!initialData}
            className="mt-1"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium text-foreground">Role</label>
          <select
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            required
            className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" disabled>
              Select a role
            </option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="text-sm font-medium text-destructive">{error}</div>
      )}

      <div className="flex gap-3 pt-4">
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
          {loading ? "Saving..." : initialData ? "Update User" : "Create User"}
        </Button>
      </div>
    </form>
  );
}
