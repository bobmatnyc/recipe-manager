'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="container mx-auto py-16 px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-700"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}