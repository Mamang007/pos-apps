import { AdminLayout } from "@/components/layout/admin-layout";
import { CustomerList } from "@/features/customers";

export default function CustomersPage() {
  return (
    <AdminLayout>
      <CustomerList />
    </AdminLayout>
  );
}
