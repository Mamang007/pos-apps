import { AdminLayout } from "@/components/layout/admin-layout";
import { PromotionManagement } from "@/features/promotions";

export default function PromotionsPage() {
  return (
    <AdminLayout>
      <PromotionManagement />
    </AdminLayout>
  );
}
