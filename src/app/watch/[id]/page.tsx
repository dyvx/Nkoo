import { notFound } from 'next/navigation';
import { catalogProvider } from '@/lib/providers';
import VideoView from '@/components/VideoView';
type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const video = await catalogProvider.getVideo(id);
  return { title: video ? `Watching ${video.title}` : 'Film not found' };
}
export default async function WatchPage({ params }: Props) {
  const { id } = await params;
  const video = await catalogProvider.getVideo(id);
  if (!video) notFound();
  return <VideoView video={video} watch />;
}
