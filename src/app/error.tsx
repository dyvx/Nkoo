'use client';
import { EmptyState } from '@/components/ui';
export default function Error({ reset }: { reset: () => void }) {
  return (
    <EmptyState
      title="Let’s take that again."
      description="Something interrupted this story. Your local library is still safe."
      action={
        <button className="btn primary" onClick={reset}>
          Try again
        </button>
      }
    />
  );
}
