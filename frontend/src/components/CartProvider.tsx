'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { useAuth } from './AuthProvider';
import {
  CartItem,
  getCart,
  addToCart as addToCartRequest,
  updateCartItem as updateCartItemRequest,
  removeCartItem as removeCartItemRequest,
  clearCart as clearCartRequest,
} from '@/lib/cart';

interface CartState {
  items: CartItem[];
  total: number;
  count: number;
  loading: boolean;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    try {
      const cart = await getCart();
      setItems(cart.items);
      setTotal(cart.total);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(async (productId: string, quantity = 1) => {
    const cart = await addToCartRequest(productId, quantity);
    setItems(cart.items);
    setTotal(cart.total);
  }, []);

  const updateItem = useCallback(async (itemId: string, quantity: number) => {
    const cart = await updateCartItemRequest(itemId, quantity);
    setItems(cart.items);
    setTotal(cart.total);
  }, []);

  const removeItem = useCallback(async (itemId: string) => {
    const cart = await removeCartItemRequest(itemId);
    setItems(cart.items);
    setTotal(cart.total);
  }, []);

  const clear = useCallback(async () => {
    const cart = await clearCartRequest();
    setItems(cart.items);
    setTotal(cart.total);
  }, []);

  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, total, count, loading, addItem, updateItem, removeItem, clear, refresh }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart doit être utilisé à l’intérieur de <CartProvider>');
  return ctx;
}
