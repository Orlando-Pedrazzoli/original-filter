'use client';

import { createContext, useContext } from 'react';

const CartContext = createContext({});

export function CartProvider({ children }: { children: React.ReactNode }) {
  return <CartContext.Provider value={{}}>{children}</CartContext.Provider>;
}

export const useCartContext = () => useContext(CartContext);
