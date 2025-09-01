'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  codigo: string
  nombre: string
  precio: number
  cantidad: number
  stock_disponible: number
  imagen_url?: string
  categoria: string
  marca: string
}

interface CartStore {
  items: CartItem[]
  _hasHydrated: boolean
  addItem: (item: Omit<CartItem, 'cantidad'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, cantidad: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
  getItemById: (id: string) => CartItem | undefined
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      _hasHydrated: false,
      
      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find(i => i.id === item.id)
          
          if (existingItem) {
            // Verificar stock disponible
            const newQuantity = existingItem.cantidad + 1
            if (newQuantity > item.stock_disponible) {
              console.warn('⚠️ No hay suficiente stock disponible')
              return state
            }
            
            return {
              items: state.items.map(i =>
                i.id === item.id
                  ? { ...i, cantidad: newQuantity }
                  : i
              )
            }
          } else {
            return {
              items: [...state.items, { ...item, cantidad: 1 }]
            }
          }
        })
      },
      
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter(i => i.id !== id)
        }))
      },
      
      updateQuantity: (id, cantidad) => {
        set((state) => {
          const item = state.items.find(i => i.id === id)
          if (!item) return state
          
          // Verificar stock disponible
          if (cantidad > item.stock_disponible) {
            console.warn('⚠️ Cantidad excede stock disponible')
            return state
          }
          
          if (cantidad <= 0) {
            return {
              items: state.items.filter(i => i.id !== id)
            }
          }
          
          return {
            items: state.items.map(i =>
              i.id === id ? { ...i, cantidad } : i
            )
          }
        })
      },
      
      clearCart: () => {
        set({ items: [] })
      },
      
      getTotal: () => {
        const { items } = get()
        return items.reduce((total, item) => total + (item.precio * item.cantidad), 0)
      },
      
      getItemCount: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.cantidad, 0)
      },
      
      getItemById: (id) => {
        const { items } = get()
        return items.find(item => item.id === id)
      }
    }),
    {
      name: 'logicqp-cart',
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
        }
      }
    }
  )
)
