import { authFetch } from './api';

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    slug: string;
    price: string;
    images: { url: string; isMain: boolean }[];
  };
}

export interface CartResponse {
  items: CartItem[];
  total: number;
}

export function getCart() {
  return authFetch<CartResponse>('/cart');
}

export function addToCart(productId: string, quantity = 1) {
  return authFetch<CartResponse>('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  });
}

export function updateCartItem(itemId: string, quantity: number) {
  return authFetch<CartResponse>(`/cart/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  });
}

export function removeCartItem(itemId: string) {
  return authFetch<CartResponse>(`/cart/items/${itemId}`, {
    method: 'DELETE',
  });
}

export function clearCart() {
  return authFetch<CartResponse>('/cart', { method: 'DELETE' });
}

export interface CreateOrderInput {
  fullName: string;
  phone: string;
  email?: string;
  comment?: string;
  deliveryType: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  title: string;
  price: string;
  quantity: number;
}

export interface Order {
  id: string;
  number: string;
  status: string;
  totalAmount: string;
  fullName: string;
  phone: string;
  email?: string;
  comment?: string;
  deliveryType: string;
  items: OrderItem[];
  createdAt: string;
}

export function createOrder(input: CreateOrderInput) {
  return authFetch<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
