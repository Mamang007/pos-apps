import { AdminLayout } from "@/components/layout/admin-layout";
import { InventoryManagement } from "@/features/inventory/components/InventoryManagement";

export default function InventoryPage() {
  return (
    <AdminLayout>
      <div className="p-6">
        <InventoryManagement />
      </div>
    </AdminLayout>
  );
}
