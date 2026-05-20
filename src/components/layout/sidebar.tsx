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
  ChevronDown,
  ShoppingBag,
  Boxes,
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
      { label: "Sales History", href: "/sales", icon: FileText },
      { label: "Inventory", href: "/inventory", icon: Boxes },
      { label: "Purchase Order", href: "/procurement", icon: ShoppingBag },
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
    items: [{ label: "Settings", href: "/settings", icon: Settings }],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useLayoutStore();
  const [masterDataOpen, setMasterDataOpen] = useState(true);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-300",
        sidebarOpen ? "w-64" : "w-20"
      )}
    >
      <div className="flex h-16 items-center justify-between px-6 border-b border-border">
        <div className={cn("flex items-center gap-3", !sidebarOpen && "hidden")}>
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Store className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            POS YOGA
          </span>
        </div>
        {!sidebarOpen && (
          <div className="mx-auto h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Store className="h-5 w-5 text-primary-foreground" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6 py-6 px-4">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-2">
            {sidebarOpen && (
              <h3 className="px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                {group.label}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all group",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0",
                        isActive ? "text-primary-foreground" : "group-hover:scale-110 transition-transform"
                      )}
                    />
                    {sidebarOpen && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {sidebarOpen && (
        <div className="absolute bottom-6 left-0 w-full px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hidden lg:flex"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      )}
      {!sidebarOpen && (
        <div className="absolute bottom-6 left-0 w-full flex justify-center">
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
