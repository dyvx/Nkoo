import { Suspense } from 'react';
import SearchView from '@/components/SearchView';
import { LoadingSkeleton } from '@/components/ui';
export const metadata = { title: 'Discover something good' };
export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <SearchView />
    </Suspense>
  );
}
