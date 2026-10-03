import { notFound } from 'next/navigation';
import { catalogProvider } from '@/lib/providers';
import CreatorView from '@/components/CreatorView';
type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const creator = await catalogProvider.getCreator(id);
  return { title: creator?.name || 'Creator not found' };
}
export default async function CreatorPage({ params }: Props) {
  const { id } = await params;
  const creator = await catalogProvider.getCreator(id);
  if (!creator) notFound();
  return <CreatorView creator={creator} />;
}
