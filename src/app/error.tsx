'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">
      <h1 className="text-4xl font-bold text-error mb-4">Something went wrong</h1>
      <p className="text-foreground/60 text-lg mb-8">
        An unexpected error occurred. Try again or head back to the home page.
      </p>
      <button
        onClick={reset}
        className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-background font-semibold rounded-lg transition-colors text-sm"
      >
        Try Again
      </button>
    </div>
  );
}
