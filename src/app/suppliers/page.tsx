import { AdminLayout } from "@/components/layout/admin-layout";
import { SupplierList } from "@/features/suppliers";

export default function SuppliersPage() {
  return (
    <AdminLayout>
      <SupplierList />
    </AdminLayout>
  );
}
