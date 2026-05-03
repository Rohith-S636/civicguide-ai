'use client';

import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-civic-light flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold bg-gradient-civic bg-clip-text text-transparent mb-4">
          404
        </h1>
        <p className="text-2xl font-semibold text-gray-900 mb-2">Page Not Found</p>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button
          variant="default"
          size="lg"
          asChild
        >
          <Link href="/">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
