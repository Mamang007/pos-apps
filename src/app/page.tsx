import { AdminLayout } from "@/components/layout/admin-layout";
import { getDashboardStats } from "@/features/dashboard/services/actions";
import { 
  TrendingUp, 
  ShoppingBag, 
  AlertTriangle, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  Clock
} from "lucide-react";
import { format } from "date-fns";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (!stats) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Failed to load dashboard data.</p>
        </div>
      </AdminLayout>
    );
  }

  const metricCards = [
    { 
      label: "Total Revenue (Today)", 
      value: formatCurrency(stats.revenue), 
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    { 
      label: "Transactions (Today)", 
      value: stats.transactions.toString(), 
      icon: ShoppingBag,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    { 
      label: "Average Order", 
      value: formatCurrency(stats.avgOrder), 
      icon: Users,
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
    { 
      label: "Low Stock Items", 
      value: stats.lowStockCount.toString(), 
      icon: AlertTriangle,
      color: stats.lowStockCount > 0 ? "text-rose-500" : "text-muted-foreground",
      bg: stats.lowStockCount > 0 ? "bg-rose-500/10" : "bg-muted/10"
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8 p-1">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Overview</h2>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(), "EEEE, dd MMMM yyyy")}</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {metricCards.map((card, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className={`absolute top-0 right-0 h-24 w-24 -mr-8 -mt-8 rounded-full ${card.bg} blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />
              <div className="flex items-start justify-between relative z-10">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                  <h3 className="text-2xl font-bold text-foreground">{card.value}</h3>
                </div>
                <div className={`p-2.5 rounded-xl ${card.bg} ${card.color}`}>
                   <card.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-7">
          <div className="md:col-span-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <h4 className="font-bold text-lg">Sales Trend (Last 7 Days)</h4>
             </div>
             <div className="h-[300px] flex items-end justify-between gap-2 px-2">
                {stats.trend.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground italic">
                    No sales data for the last 7 days.
                  </div>
                ) : (
                  stats.trend.map((day, idx) => {
                    const max = Math.max(...stats.trend.map(t => t.total), 1);
                    const height = (day.total / max) * 100;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="w-full relative">
                           <div 
                             className="w-full bg-primary/20 hover:bg-primary/40 rounded-t-lg transition-all duration-500 ease-out flex items-end justify-center group-hover:bg-primary" 
                             style={{ height: `${height}%`, minHeight: '4px' }}
                           >
                             <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded border border-border font-bold shadow-sm whitespace-nowrap z-20">
                               {formatCurrency(day.total)}
                             </div>
                           </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium rotate-45 sm:rotate-0 origin-left mt-2">
                          {format(new Date(day.date), "dd MMM")}
                        </span>
                      </div>
                    )
                  })
                )}
             </div>
          </div>

          <div className="md:col-span-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <h4 className="font-bold text-lg">Recent Transactions</h4>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
             </div>
             <div className="space-y-6">
                {stats.recentSales.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground italic text-sm">
                    No transactions yet.
                  </div>
                ) : (
                  stats.recentSales.map((sale) => (
                    <div key={sale.id} className="flex items-center gap-4">
                       <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                          <Clock className="h-5 w-5" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">
                             {sale.customerName || "Cash Customer"}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                             {format(new Date(sale.date), "HH:mm")} • Order #{sale.id.slice(0, 8)}
                          </p>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-bold text-primary">
                             {formatCurrency(Number(sale.total))}
                          </p>
                          <div className="flex items-center justify-end text-[10px] text-emerald-500 font-bold">
                             <ArrowUpRight className="h-3 w-3" />
                             <span>PAID</span>
                          </div>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
