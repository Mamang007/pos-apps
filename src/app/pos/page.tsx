import { AdminLayout } from "@/components/layout/admin-layout";
import { POSInterface } from "@/features/pos/components/POSInterface";
import { getPOSProducts, getPOSCustomers } from "@/features/pos/services/actions";

export default async function POSPage() {
  const products = await getPOSProducts();
  const customers = await getPOSCustomers();

  return (
    <AdminLayout>
      <POSInterface products={products} customers={customers} />
    </AdminLayout>
  );
}
