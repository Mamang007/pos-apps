import { AdminLayout } from "@/components/layout/admin-layout";
import { UserList } from "@/features/users";

export default function UsersPage() {
  return (
    <AdminLayout>
      <UserList />
    </AdminLayout>
  );
}
