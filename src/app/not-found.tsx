import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">
      <h1 className="text-6xl font-bold text-accent mb-4">404</h1>
      <p className="text-foreground/60 text-lg mb-8">
        This page doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-background font-semibold rounded-lg transition-colors text-sm"
      >
        Back to Home
      </Link>
    </div>
  );
}
