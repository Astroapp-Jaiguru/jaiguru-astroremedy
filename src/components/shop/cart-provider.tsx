"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  pricePaise: number;
  image: string | null;
  vendorId: string | null;
  vendorName: string;
  vendorLogo: string | null;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotalPaise: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const value = useMemo<CartContextValue>(() => ({
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotalPaise: items.reduce((sum, item) => sum + item.pricePaise * item.quantity, 0),
    addItem: (item, quantity = 1) => setItems((current) => {
      const existing = current.find((entry) => entry.id === item.id);
      if (existing) return current.map((entry) => entry.id === item.id ? { ...entry, quantity: entry.quantity + quantity } : entry);
      return [...current, { ...item, quantity }];
    }),
    updateQuantity: (id, quantity) => setItems((current) => quantity > 0 ? current.map((item) => item.id === id ? { ...item, quantity } : item) : current.filter((item) => item.id !== id)),
    removeItem: (id) => setItems((current) => current.filter((item) => item.id !== id)),
    clear: () => setItems([]),
  }), [items]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}

export function formatPaise(paise: number) {
  return `₹${new Intl.NumberFormat("en-IN").format(Math.round(paise / 100))}`;
}
