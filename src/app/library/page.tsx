import { Suspense } from 'react';
import LibraryView from '@/components/LibraryView';
import { LoadingSkeleton } from '@/components/ui';
export const metadata = { title: 'Your library' };
export default function LibraryPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <LibraryView />
    </Suspense>
  );
}
