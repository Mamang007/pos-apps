import { AdminLayout } from "@/components/layout/admin-layout";

export default function Home() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Dashboard</h2>
          <p className="text-zinc-500 dark:text-zinc-400">Overview of your store performance.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Revenue", value: "$45,231.89", trend: "+20.1% from last month" },
            { label: "Sales", value: "+2350", trend: "+180.1% from last month" },
            { label: "Active Products", value: "12,234", trend: "+19% from last month" },
            { label: "Active Customers", value: "573", trend: "+201 since last hour" },
          ].map((stat, i) => (
            <div key={i} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.label}</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{stat.trend}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 min-h-[300px] flex items-center justify-center">
           <p className="text-zinc-500 italic">Sales chart will be implemented here...</p>
        </div>
      </div>
    </AdminLayout>
  );
}
