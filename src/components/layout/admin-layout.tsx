"use client";

import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { useLayoutStore } from "@/hooks/use-layout-store";
import { cn } from "@/lib/utils";
import { SessionProvider } from "next-auth/react";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useLayoutStore();

  return (
    <SessionProvider>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <Sidebar />
        <div
          className={cn(
            "flex flex-col transition-all duration-300",
            sidebarOpen ? "pl-64" : "pl-20"
          )}
        >
          <Navbar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
