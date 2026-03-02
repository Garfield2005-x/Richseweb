"use client"

import { createContext, useContext, useState } from "react"
import type { Product } from "@/data/products"

type CartItem = Product & { quantity: number }

type CartType = {
  cart: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  increaseQty: (id: number) => void
  decreaseQty: (id: number) => void
}

const CartContext = createContext<CartType | null>(null)


export function CartProvider({ children }: { children: React.ReactNode }) {
  
  const [cart, setCart] = useState<CartItem[]>([])

 const addToCart = (product: Product, quantity: number = 1) => {
  setCart(prev => {
    const exist = prev.find(item => item.id === product.id)

    if (exist) {
      return prev.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      )
    }

    return [...prev, { ...product, quantity }]
  })
}

  const increaseQty = (id: number) => {
    setCart(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    )
  }

  const decreaseQty = (id: number) => {
    setCart(prev =>
      prev
        .map(item =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter(item => item.quantity > 0)
    )
  }
  const clearCart = () => {
  setCart([])
}

  return (
    <CartContext.Provider
    value={{ cart, addToCart, increaseQty, decreaseQty, clearCart }}
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