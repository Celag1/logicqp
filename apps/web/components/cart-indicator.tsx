"use client";

import { ShoppingCart } from "lucide-react";
import { useSafeCart } from "@/hooks/useSafeCart";
import CartLoading from "./cart-loading";

export default function CartIndicator() {
  const { getItemCount, isHydrated } = useSafeCart();

  if (!isHydrated) {
    return <CartLoading />;
  }

  const itemCount = getItemCount();

  return (
    <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full">
      <ShoppingCart className="h-5 w-5 text-blue-600" />
      <span className="text-blue-600 font-semibold">
        {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
      </span>
    </div>
  );
}
