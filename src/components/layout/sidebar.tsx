"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  ChevronLeft,
  Store,
  FileText,
  Tags,
  Truck,
  UserCog,
  ShieldCheck,
  Ticket,
  ChevronDown
} from "lucide-react";
import { useLayoutStore } from "@/hooks/use-layout-store";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navGroups = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      { label: "POS", href: "/pos", icon: ShoppingCart },
    ],
  },
  {
    label: "Master Data",
    items: [
      { label: "Products", href: "/products", icon: Package },
      { label: "Categories", href: "/categories", icon: Tags },
      { label: "Suppliers", href: "/suppliers", icon: Truck },
      { label: "Customers", href: "/customers", icon: Users },
      { label: "Users", href: "/users", icon: UserCog },
      { label: "Roles", href: "/roles", icon: ShieldCheck },
      { label: "Discounts", href: "/promotions", icon: Ticket },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Reports", href: "/reports", icon: FileText },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useLayoutStore();
  const [masterDataOpen, setMasterDataOpen] = useState(true);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-300 overflow-y-auto overflow-x-hidden",
        sidebarOpen ? "w-64" : "w-20"
      )}
    >
      <div className="sticky top-0 z-10 flex h-16 items-center justify-between px-4 border-b border-border bg-card">
        <div className={cn("flex items-center gap-2", !sidebarOpen && "justify-center w-full")}>
          <Store className="h-8 w-8 text-foreground" />
          {sidebarOpen && (
            <span className="text-xl font-bold tracking-tight text-foreground">POS YOGA</span>
          )}
        </div>
        {sidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hidden lg:flex"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="py-4 flex flex-col gap-6 px-2">
        {navGroups.map((group) => (
          <div key={group.label} className="flex flex-col gap-1">
            {sidebarOpen && (
              <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                {group.label}
              </h3>
            )}
            <div className="flex flex-col gap-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      !sidebarOpen && "justify-center"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!sidebarOpen && (
        <div className="mt-auto mb-4 w-full flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hidden lg:flex"
          >
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </Button>
        </div>
      )}
    </aside>
  );
}
