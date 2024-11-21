'use client';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Loading...
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Preparing your lecture recording interface
          </p>
        </div>
      </div>
    </div>
  );
}
