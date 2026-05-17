import { AdminLayout } from "@/components/layout/admin-layout";
import { ProductList } from "@/features/products";

export default function ProductsPage() {
  return (
    <AdminLayout>
      <ProductList />
    </AdminLayout>
  );
}
