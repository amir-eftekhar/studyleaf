'use client';

import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-bold">
            Something went wrong!
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {error.message || 'An unexpected error occurred'}
          </p>
        </div>
        <div className="flex justify-center space-x-4">
          <Button
            onClick={reset}
            variant="outline"
          >
            Try again
          </Button>
          <Button
            onClick={() => router.push('/')}
            variant="default"
          >
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
