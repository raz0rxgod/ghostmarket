const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

// backend отдаёт статику (/uploads/...) с корня, без префикса /api —
// см. main.ts (useStaticAssets вызван до setGlobalPrefix('api')).
const SERVER_ROOT = API_URL.replace(/\/api\/?$/, '');

// url приходит из БД как относительный путь вида "/uploads/xxx.webp"
export function imageUrl(url: string): string {
  if (/^https?:\/\//.test(url)) return url;
  return `${SERVER_ROOT}${url}`;
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }

  return res.json();
}

// Для клиентских компонентов, которым нужен собственный access-токен
// пользователя (корзина, избранное, личный кабинет, админка). При 401 один
// раз пробует обновить токен через refresh и повторяет запрос — импорт
// lib/auth сделан лениво (динамически), чтобы не тащить работу с
// localStorage в серверные бандлы, где используется apiFetch.
export async function authFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const { getAccessToken, refreshTokens, clearTokens } = await import('./auth');

  const doRequest = async (token: string | null) => {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
      cache: 'no-store',
    });
    return res;
  };

  let token = getAccessToken();
  let res = await doRequest(token);

  if (res.status === 401) {
    try {
      token = await refreshTokens();
    } catch {
      clearTokens();
      throw new Error('Votre session a expiré, reconnectez-vous');
    }
    res = await doRequest(token);
  }

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }

  return res.json();
}

// Вариант authFetch для multipart/form-data (загрузка файлов) — без
// Content-Type: JSON, браузер сам проставит правильный boundary.
export async function authFetchForm<T>(path: string, formData: FormData): Promise<T> {
  const { getAccessToken, refreshTokens, clearTokens } = await import('./auth');

  const doRequest = async (token: string | null) => {
    return fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
  };

  let token = getAccessToken();
  let res = await doRequest(token);

  if (res.status === 401) {
    try {
      token = await refreshTokens();
    } catch {
      clearTokens();
      throw new Error('Votre session a expiré, reconnectez-vous');
    }
    res = await doRequest(token);
  }

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }

  return res.json();
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  sortOrder: number;
  isMain: boolean;
}

export function getProductImages(productId: string) {
  return apiFetch<ProductImage[]>(`/product-images/product/${productId}`);
}

export function uploadImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  return authFetchForm<{ url: string }>('/uploads/image', formData);
}

export function attachProductImage(dto: { productId: string; url: string; isMain?: boolean }) {
  return authFetch<ProductImage>('/product-images', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export function setMainProductImage(id: string) {
  return authFetch<ProductImage>(`/product-images/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ isMain: true }),
  });
}

export function deleteProductImage(id: string) {
  return authFetch<{ success: boolean }>(`/product-images/${id}`, {
    method: 'DELETE',
  });
}

export interface ProductAttributeValueRef {
  attributeValue: { id: string; value: string; attributeId: string; attribute?: { name: string } };
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  price: string;
  oldPrice?: string;
  images: { url: string; isMain: boolean }[];
  attributeValues?: ProductAttributeValueRef[];
}

export interface ProductsResponse {
  items: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export function getProducts(params?: Record<string, string>) {
  const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
  return apiFetch<ProductsResponse>(`/products${qs}`);
}

export interface ProductDetail extends Product {
  description?: string;
  category: { id: string; name: string; slug: string };
  brand?: { id: string; name: string; slug: string };
}

export function getProductBySlug(slug: string) {
  return apiFetch<ProductDetail>(`/products/${slug}`);
}

// ===== Категории =====

export interface Category {
  id: string;
  name: string;
  slug: string;
  children: Category[];
}

export function getCategoryTree() {
  return apiFetch<Category[]>('/categories');
}

export interface CategoryFlat {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export function getCategoriesFlat() {
  return apiFetch<CategoryFlat[]>('/categories/flat');
}

export interface CreateCategoryInput {
  name: string;
  parentId?: string;
  sortOrder?: number;
}

export function createCategory(dto: CreateCategoryInput) {
  return authFetch<CategoryFlat>('/categories', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export function deleteCategory(id: string) {
  return authFetch<{ success: boolean }>(`/categories/${id}`, { method: 'DELETE' });
}

// ===== Бренды =====

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
}

export function getBrands() {
  return apiFetch<Brand[]>('/brands');
}

export function createBrand(dto: { name: string; logoUrl?: string }) {
  return authFetch<Brand>('/brands', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export function deleteBrand(id: string) {
  return authFetch<{ success: boolean }>(`/brands/${id}`, { method: 'DELETE' });
}

// ===== Товары (админка) =====
// Отдельный тип от Product/ProductDetail — здесь есть все "сырые" поля
// (categoryId/brandId/sku/stock и т.д.), нужные для форм создания/редактирования.

export interface AdminProduct {
  id: string;
  title: string;
  slug: string;
  sku: string;
  description?: string | null;
  price: string;
  oldPrice?: string | null;
  stock: number;
  isActive: boolean;
  categoryId: string;
  brandId?: string | null;
  images: ProductImage[];
  category?: { id: string; name: string };
  brand?: { id: string; name: string } | null;
  attributeValues?: ProductAttributeValueRef[];
}

export function getAdminProducts(params?: Record<string, string>) {
  const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
  return apiFetch<{ items: AdminProduct[]; total: number }>(`/products${qs}`);
}

export interface CreateProductInput {
  title: string;
  sku: string;
  description?: string;
  price: number;
  oldPrice?: number;
  stock?: number;
  categoryId: string;
  brandId?: string;
  attributeValueIds?: string[];
}

export function createProduct(dto: CreateProductInput) {
  return authFetch<AdminProduct>('/products', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export function updateProduct(id: string, dto: Partial<CreateProductInput>) {
  return authFetch<AdminProduct>(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
}

export function deleteProduct(id: string) {
  return authFetch<{ success: boolean }>(`/products/${id}`, { method: 'DELETE' });
}

// ===== Атрибуты (фильтры каталога, характеристики товара) =====

export interface AttributeValue {
  id: string;
  attributeId: string;
  value: string;
}

export interface Attribute {
  id: string;
  name: string;
  values: AttributeValue[];
}

export function getAttributes() {
  return apiFetch<Attribute[]>('/attributes');
}

export function createAttribute(name: string) {
  return authFetch<Attribute>('/attributes', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export function deleteAttribute(id: string) {
  return authFetch<{ success: boolean }>(`/attributes/${id}`, { method: 'DELETE' });
}

export function addAttributeValue(attributeId: string, value: string) {
  return authFetch<AttributeValue>(`/attributes/${attributeId}/values`, {
    method: 'POST',
    body: JSON.stringify({ value }),
  });
}

export function deleteAttributeValue(valueId: string) {
  return authFetch<{ success: boolean }>(`/attributes/values/${valueId}`, { method: 'DELETE' });
}

// ===== Тексты сайта (Settings) =====

export interface SiteSettings {
  shop_name: string;
  phone: string;
  email: string;
  address: string;
  hero_title: string;
  hero_subtitle: string;
  footer_description: string;
  [key: string]: string;
}

export function getSettings() {
  return apiFetch<SiteSettings>('/settings');
}

export function updateSettings(dto: Partial<SiteSettings>) {
  return authFetch<SiteSettings>('/settings', {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
}

// ===== Статические страницы (О компании, Доставка и т.д.) =====

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export function getPages() {
  return apiFetch<Page[]>('/pages');
}

export function getPageBySlug(slug: string) {
  return apiFetch<Page>(`/pages/${slug}`);
}

export function createPage(dto: { title: string; content: string }) {
  return authFetch<Page>('/pages', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export function updatePage(id: string, dto: Partial<{ title: string; content: string }>) {
  return authFetch<Page>(`/pages/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
}

export function deletePage(id: string) {
  return authFetch<{ success: boolean }>(`/pages/${id}`, { method: 'DELETE' });
}
