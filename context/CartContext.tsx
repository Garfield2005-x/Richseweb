"use client"

import { createContext, useContext, useState } from "react"
import toast from "react-hot-toast"
export type Product = {
  id: number
  name: string
  price: number
  image: string
  taxe: string
  stock?: number
  variantId?: number
  variantName?: string
};

type CartItem = Product & { quantity: number }

type CartType = {
  cart: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  increaseQty: (id: number, variantId?: number) => void
  decreaseQty: (id: number, variantId?: number) => void
  removeItem: (id: number, variantId?: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartType | null>(null)


export function CartProvider({ children }: { children: React.ReactNode }) {
  
  const [cart, setCart] = useState<CartItem[]>([])

  const isSameItem = (a: { id: number, variantId?: number }, b: { id: number, variantId?: number }) => 
    a.id === b.id && a.variantId === b.variantId;

 const addToCart = (product: Product, quantity: number = 1) => {
    const exist = cart.find(item => isSameItem(item, product));
    const stockLimit = product.stock ?? 999;

    if (exist) {
      if (exist.quantity + quantity > stockLimit) {
        toast.error(`Cannot add more. Only ${stockLimit} left in stock.`);
        return;
      }
    } else if (quantity > stockLimit) {
      toast.error(`Cannot add more. Only ${stockLimit} left in stock.`);
      return;
    }

    toast.success("Added to cart!");

    setCart(prev => {
      const prevExist = prev.find(item => isSameItem(item, product))
      
      if (prevExist) {
        if (prevExist.quantity + quantity > stockLimit) return prev;
        return prev.map(item =>
          isSameItem(item, product)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }

      if (quantity > stockLimit) return prev;
      return [...prev, { ...product, quantity }]
    })
  }

  const increaseQty = (id: number, variantId?: number) => {
    const target = { id, variantId };
    const item = cart.find(i => isSameItem(i, target));
    if (item) {
      const stockLimit = item.stock ?? 999;
      if (item.quantity + 1 > stockLimit) {
        toast.error(`Cannot increase. Only ${stockLimit} left in stock.`);
        return;
      }
    }

    setCart(prev => {
      return prev.map(item => {
        if (isSameItem(item, target)) {
          const stockLimit = item.stock ?? 999;
          if (item.quantity + 1 > stockLimit) return item;
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      })
    })
  }

  const decreaseQty = (id: number, variantId?: number) => {
    const target = { id, variantId };
    setCart(prev =>
      prev
        .map(item =>
          isSameItem(item, target)
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter(item => item.quantity > 0)
    )
  }

  const removeItem = (id: number, variantId?: number) => {
    const target = { id, variantId };
    setCart(prev => prev.filter(item => !isSameItem(item, target)));
  }

  const clearCart = () => {
    setCart([])
  }

  return (
    <CartContext.Provider
    value={{ cart, addToCart, increaseQty, decreaseQty, removeItem, clearCart }}
  >
    {children}
  </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used inside CartProvider")
  return context
}