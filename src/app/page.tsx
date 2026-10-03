import { Suspense } from 'react';
import HomeView from '@/components/HomeView';
import { LoadingSkeleton } from '@/components/ui';
export default function HomePage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <HomeView />
    </Suspense>
  );
}
