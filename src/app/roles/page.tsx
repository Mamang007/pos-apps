import { AdminLayout } from "@/components/layout/admin-layout";
import { RoleList } from "@/features/roles";

export default function RolesPage() {
  return (
    <AdminLayout>
      <RoleList />
    </AdminLayout>
  );
}
