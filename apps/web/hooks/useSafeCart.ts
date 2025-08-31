'use client'

import { useCart } from './useCart';
import { useHydration } from './useHydration';

export function useSafeCart() {
  const cart = useCart();
  const isHydrated = useHydration();

  // Retornar valores seguros durante la hidratación
  if (!isHydrated) {
    return {
      items: [],
      addItem: () => {},
      removeItem: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      getTotal: () => 0,
      getItemCount: () => 0,
      getItemById: () => undefined,
      isHydrated: false
    };
  }

  return {
    ...cart,
    isHydrated: true
  };
}
