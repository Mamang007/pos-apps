"use client";

import { useSession, signOut } from "next-auth/react";
import { useLayoutStore } from "@/hooks/use-layout-store";
import { Button } from "@/components/ui/button";
import { Menu, User, LogOut, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { sidebarOpen, toggleSidebar } = useLayoutStore();
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className={cn("lg:hidden mr-4")}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex flex-1 items-center justify-between">
        <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Welcome back, <span className="text-black dark:text-white font-semibold">{session?.user?.name || "User"}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3 pl-2 border-l border-zinc-200 dark:border-zinc-800">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{session?.user?.email}</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-8 w-8"
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
