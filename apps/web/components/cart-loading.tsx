"use client";

import { ShoppingCart } from "lucide-react";

export default function CartLoading() {
  return (
    <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full animate-pulse">
      <ShoppingCart className="h-5 w-5 text-blue-600" />
      <div className="w-20 h-4 bg-blue-200 rounded"></div>
    </div>
  );
}
