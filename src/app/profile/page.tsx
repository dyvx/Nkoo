import { Suspense } from 'react';
import ProfileView from '@/components/ProfileView';
import { LoadingSkeleton } from '@/components/ui';
export const metadata = { title: 'Your space' };
export default function ProfilePage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ProfileView />
    </Suspense>
  );
}
