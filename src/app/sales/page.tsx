import { AdminLayout } from "@/components/layout/admin-layout";
import { SalesManagement } from "@/features/pos/components/SalesManagement";

export default function SalesPage() {
  return (
    <AdminLayout>
      <div className="p-6">
        <SalesManagement />
      </div>
    </AdminLayout>
  );
}
