"use client";

import { useState } from "react";
import { Search, Filter, PackageX } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type Product } from "../types";
import { useCart } from "../hooks/use-cart";

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  const [search, setSearch] = useState("");
  const { addItem, items } = useCart();

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search))
  );

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(value));
  };

  const getStockInfo = (product: Product) => {
    const cartItem = items.find((item) => item.productId === product.id);
    const cartQuantity = cartItem?.quantity || 0;
    const availableStock = (product.stock || 0) - cartQuantity;
    return {
      availableStock,
      isOutOfStock: (product.stock || 0) <= 0 || availableStock <= 0,
    };
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products by name, SKU, or barcode..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pr-2 pb-4">
          {filteredProducts.map((product) => {
            const { availableStock, isOutOfStock } = getStockInfo(product);

            return (
              <div
                key={product.id}
                className={cn(
                  "group relative flex flex-col bg-card border border-border rounded-xl overflow-hidden transition-all shadow-sm",
                  isOutOfStock 
                    ? "opacity-60 grayscale cursor-not-allowed" 
                    : "hover:border-primary/50 cursor-pointer active:scale-95"
                )}
                onClick={() => !isOutOfStock && addItem(product)}
              >
                {isOutOfStock && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/20 backdrop-blur-[1px]">
                     <PackageX className="h-8 w-8 text-destructive mb-1" />
                     <span className="text-[10px] font-bold uppercase tracking-wider text-destructive">Out of Stock</span>
                  </div>
                )}

                <div className="aspect-square bg-muted flex items-center justify-center p-4">
                  <span className="text-4xl font-bold text-muted-foreground/20">
                    {product.name.charAt(0)}
                  </span>
                  {!isOutOfStock && (
                    <div className="absolute top-2 right-2">
                       <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
                        Stock: {availableStock}
                       </span>
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-1">
                  <p className="text-xs text-muted-foreground font-mono truncate">{product.sku}</p>
                  <p className="font-semibold text-sm line-clamp-2 min-h-[2.5rem] leading-tight group-hover:text-primary transition-colors">
                    {product.name}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <p className="font-bold text-primary">{formatCurrency(product.sellPrice)}</p>
                    <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                      {product.uom}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredProducts.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Search className="h-12 w-12 mb-4 opacity-20" />
              <p>No products found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
