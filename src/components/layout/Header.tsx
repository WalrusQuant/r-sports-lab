import Link from 'next/link';

interface HeaderProps {
  moduleTitle?: string;
}

export default function Header({ moduleTitle }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-lg font-bold text-accent hover:text-accent-hover transition-colors">
          R Sports Lab
        </Link>
        {moduleTitle && (
          <>
            <span className="text-foreground/20">/</span>
            <span className="text-sm text-foreground/60">{moduleTitle}</span>
          </>
        )}
      </div>
      <div className="text-xs text-foreground/30">
        Powered by WebR
      </div>
    </header>
  );
}
