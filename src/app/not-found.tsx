import Link from "next/link";
import { MoveLeft, Search, ShoppingBag } from "lucide-react";

export default function NotFound() {
  const buttonBase = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-11 px-8";
  const buttonPrimary = "bg-primary text-primary-foreground hover:bg-primary/90";
  const buttonOutline = "border border-input bg-background hover:bg-accent hover:text-accent-foreground";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative flex justify-center">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
          <div className="relative bg-card border border-border h-32 w-32 rounded-3xl flex items-center justify-center shadow-2xl rotate-3">
             <Search className="h-16 w-16 text-primary" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 h-10 w-10 rounded-xl flex items-center justify-center shadow-lg -rotate-12 border-2 border-background">
             <ShoppingBag className="h-5 w-5 text-white" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-7xl font-black tracking-tighter text-primary">404</h1>
          <h2 className="text-2xl font-bold">Page Not Found</h2>
          <p className="text-muted-foreground">
            Oops! The page you&apos;re looking for has gone missing or never existed in this store.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link href="/" className={`${buttonBase} ${buttonPrimary} font-bold`}>
            <MoveLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <Link href="/pos" className={`${buttonBase} ${buttonOutline}`}>
            Go to POS
          </Link>
        </div>

        <div className="pt-12">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold opacity-50">
            POS YOGA System
          </p>
        </div>
      </div>
    </div>
  );
}
