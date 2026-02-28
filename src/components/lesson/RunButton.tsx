'use client';

interface RunButtonProps {
  onClick: () => void;
  isRunning: boolean;
  disabled?: boolean;
}

export default function RunButton({ onClick, isRunning, disabled }: RunButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isRunning || disabled}
      className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-background font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
    >
      {isRunning ? (
        <>
          <div className="animate-spin w-4 h-4 border-2 border-background/30 border-t-background rounded-full" />
          Running...
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
          </svg>
          Run Code
        </>
      )}
    </button>
  );
}
