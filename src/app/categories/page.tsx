import { AdminLayout } from "@/components/layout/admin-layout";
import { CategoryList } from "@/features/categories";

export default function CategoriesPage() {
  return (
    <AdminLayout>
      <CategoryList />
    </AdminLayout>
  );
}
