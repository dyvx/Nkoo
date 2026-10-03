import Link from 'next/link';
import { EmptyState } from '@/components/ui';
export default function NotFound() {
  return (
    <div>
      <h1 className="sr-only">Page not found</h1>
      <EmptyState
        icon="compass"
        title="A little off the beaten path."
        description="We couldn’t find that page, but there’s a whole world of good stories waiting for you."
        action={
          <Link className="btn primary" href="/">
            Back to discovery
          </Link>
        }
      />
    </div>
  );
}
