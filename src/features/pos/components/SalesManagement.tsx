"use client";

import { useState } from "react";
import { SalesList } from "./SalesList";
import { SalesDetail } from "./SalesDetail";
import { type SalesOrderWithDetails } from "../types";

export function SalesManagement() {
  const [selectedOrder, setSelectedOrder] = useState<SalesOrderWithDetails | null>(null);

  if (selectedOrder) {
    return (
      <SalesDetail 
        order={selectedOrder} 
        onBack={() => setSelectedOrder(null)} 
      />
    );
  }

  return (
    <SalesList onViewOrder={(order) => setSelectedOrder(order)} />
  );
}
