"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { isOpen, setIsOpen });
        }
        return child;
      })}
    </div>
  );
};

const DropdownMenuTrigger = ({ children, isOpen, setIsOpen }: { children: React.ReactNode; isOpen?: boolean; setIsOpen?: (open: boolean) => void }) => {
  return (
    <div onClick={() => setIsOpen?.(!isOpen)} className="cursor-pointer">
      {children}
    </div>
  );
};

const DropdownMenuContent = ({ children, isOpen, className }: { children: React.ReactNode; isOpen?: boolean; className?: string }) => {
  if (!isOpen) return null;
  return (
    <div className={cn(
      "absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md border border-zinc-200 bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950",
      className
    )}>
      <div className="py-1">{children}</div>
    </div>
  );
};

const DropdownMenuItem = ({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
        className
      )}
    >
      {children}
    </div>
  );
};

const DropdownMenuLabel = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="px-2 py-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
      {children}
    </div>
  );
};

const DropdownMenuSeparator = () => {
  return <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />;
};

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
};
