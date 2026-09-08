'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProductForm } from '@/components/admin/ProductForm';
import { createProduct, CreateProductInput } from '@/lib/api';

export default function NewProductPage() {
  const router = useRouter();

  async function handleSubmit(dto: CreateProductInput) {
    const product = await createProduct(dto);
    // Сразу ведём к загрузке фото — естественный следующий шаг после создания карточки
    router.push(`/admin/products/${product.id}/images`);
  }

  return (
    <main>
      <Link href="/admin/products" className="text-sm text-white/40 hover:text-white transition-colors">
        ← Tous les produits
      </Link>
      <h1 className="text-2xl font-semibold text-white mt-2 mb-6">Nouveau produit</h1>
      <ProductForm submitLabel="Créer le produit" onSubmit={handleSubmit} />
    </main>
  );
}
