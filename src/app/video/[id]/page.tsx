import { notFound } from 'next/navigation';
import { catalogProvider } from '@/lib/providers';
import VideoView from '@/components/VideoView';
type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const video = await catalogProvider.getVideo(id);
  return { title: video?.title || 'Film not found' };
}
export default async function DetailsPage({ params }: Props) {
  const { id } = await params;
  const video = await catalogProvider.getVideo(id);
  if (!video) notFound();
  return <VideoView video={video} />;
}
