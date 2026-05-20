import { AdminLayout } from "@/components/layout/admin-layout";
import { ProcurementManagement } from "@/features/procurement";

export default function ProcurementPage() {
  return (
    <AdminLayout>
      <ProcurementManagement />
    </AdminLayout>
  );
}
