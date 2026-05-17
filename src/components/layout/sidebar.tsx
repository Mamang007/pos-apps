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
  FileText
} from "lucide-react";
import { useLayoutStore } from "@/hooks/use-layout-store";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "POS", href: "/pos", icon: ShoppingCart },
  { label: "Products", href: "/products", icon: Package },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useLayoutStore();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-300",
        sidebarOpen ? "w-64" : "w-20"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
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

      <nav className="mt-4 flex flex-col gap-1 px-2">
        {navItems.map((item) => {
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
      </nav>

      {!sidebarOpen && (
        <div className="absolute bottom-4 left-0 w-full flex justify-center">
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
