"use client";

import { useSession, signOut } from "next-auth/react";
import { useLayoutStore } from "@/hooks/use-layout-store";
import { Button } from "@/components/ui/button";
import { Menu, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  const { toggleSidebar } = useLayoutStore();
  const { data: session } = useSession();

  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center border-b border-border bg-card px-4 transition-colors">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="mr-4"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex flex-1 items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground">
          Welcome back,{" "}
          <span className="text-foreground font-semibold">
            {session?.user?.name || "User"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="flex items-center gap-3 pl-2 transition-opacity hover:opacity-80">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium leading-none text-foreground">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {session?.user?.email}
                  </p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted border border-border">
                  <span className="text-xs font-bold text-foreground">
                    {userInitials}
                  </span>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-card border-border">
              <DropdownMenuLabel className="text-foreground">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem onClick={() => {}} className="text-foreground hover:bg-accent">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                className="text-red-600 dark:text-red-400 hover:bg-accent"
                onClick={() => signOut({ callbackUrl: "/auth/login" })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
