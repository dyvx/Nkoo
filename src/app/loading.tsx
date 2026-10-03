import { LoadingSkeleton } from '@/components/ui';
export default function Loading() {
  return (
    <div>
      <div className="skeleton skeleton-page-title" />
      <div className="skeleton skeleton-page-subtitle" />
      <LoadingSkeleton />
    </div>
  );
}
