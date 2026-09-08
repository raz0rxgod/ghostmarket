import { notFound } from 'next/navigation';
import { getPageBySlug } from '@/lib/api';
import { EditablePageContent } from '@/components/EditablePageContent';

export default async function StaticPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let page: Awaited<ReturnType<typeof getPageBySlug>>;
  try {
    page = await getPageBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-14">
      <EditablePageContent id={page.id} title={page.title} content={page.content} />
    </main>
  );
}
