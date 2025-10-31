"use client"

import type React from "react"
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

type CartItem = { id: string; title: string }
type CartState = {
  items: CartItem[]
  addPack: (item: CartItem) => void
  removePack: (id: string) => void
  clear: () => void
  count: number
  totalInInr: number
  selectedBundle: 2 | 3 | 5 | null
  setSelectedBundle: (val: 2 | 3 | 5 | null) => void
}

const PRICES_INR = {
  single: 499,
  bundle2: 899,
  bundle3: 1299,
  bundle5: 2199,
} as const

function calcTotal(count: number, selectedBundle: 2 | 3 | 5 | null): number {
  if (selectedBundle && count === selectedBundle) {
    if (selectedBundle === 2) return PRICES_INR.bundle2
    if (selectedBundle === 3) return PRICES_INR.bundle3
    if (selectedBundle === 5) return PRICES_INR.bundle5
  }
  // no or incomplete bundle => singles only
  return PRICES_INR.single * count
}

const CartCtx = createContext<CartState | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [selectedBundle, setSelectedBundle] = useState<2 | 3 | 5 | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("dbass_cart")
      if (raw) setItems(JSON.parse(raw))
      const rawBundle = localStorage.getItem("dbass_bundle")
      if (rawBundle === "2" || rawBundle === "3" || rawBundle === "5") {
        setSelectedBundle(Number(rawBundle) as 2 | 3 | 5)
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem("dbass_cart", JSON.stringify(items))
    } catch {}
  }, [items])

  useEffect(() => {
    try {
      if (selectedBundle) localStorage.setItem("dbass_bundle", String(selectedBundle))
      else localStorage.removeItem("dbass_bundle")
    } catch {}
  }, [selectedBundle])

  const api = useMemo<CartState>(() => {
    return {
      items,
      addPack: (item) => {
        setItems((prev) => {
          if (prev.find((p) => p.id === item.id)) return prev
          const newItems = [...prev, item]
          const newCount = newItems.length
          
          // Show bundle upsell toast if appropriate
          const shouldShowToast = !selectedBundle || newCount > selectedBundle
          
          if (shouldShowToast) {
            if (newCount === 1) {
              const singlesTotal = 2 * PRICES_INR.single
              const savings = singlesTotal - PRICES_INR.bundle2
              toast.success(`Save ₹${savings} by adding 1 more pack for Bundle of 2!`, {
                duration: 4500,
              })
            } else if (newCount === 2) {
              const singlesTotal = 3 * PRICES_INR.single
              const savings = singlesTotal - PRICES_INR.bundle3
              toast.success(`Save ₹${savings} by adding 1 more pack for Bundle of 3!`, {
                duration: 4500,
              })
            } else if (newCount === 3) {
              const singlesTotal = 5 * PRICES_INR.single
              const savings = singlesTotal - PRICES_INR.bundle5
              toast.success(`Save ₹${savings} by adding 2 more packs for Bundle of 5!`, {
                duration: 4500,
              })
            } else if (newCount === 4) {
              const singlesTotal = 5 * PRICES_INR.single
              const savings = singlesTotal - PRICES_INR.bundle5
              toast.success(`Save ₹${savings} by adding 1 more pack for Bundle of 5!`, {
                duration: 4500,
              })
            }
          }
          
          return newItems
        })
      },
      removePack: (id) => {
        setItems((prev) => prev.filter((p) => p.id !== id))
      },
      clear: () => {
        setItems([])
        setSelectedBundle(null)
      },
      count: items.length,
      totalInInr: calcTotal(items.length, selectedBundle),
      selectedBundle,
      setSelectedBundle,
    }
  }, [items, selectedBundle])

  return <CartCtx.Provider value={api}>{children}</CartCtx.Provider>
}

export function useCart() {
  const ctx = useContext(CartCtx)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}

export { PRICES_INR, calcTotal }
