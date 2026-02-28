'use client';

import { ExecutionResult } from '@/lib/webr/executor';

interface ConsoleOutputProps {
  result: ExecutionResult | null;
  isRunning: boolean;
}

export default function ConsoleOutput({ result, isRunning }: ConsoleOutputProps) {
  if (isRunning) {
    return (
      <div className="bg-[#1a1a2e] rounded-lg p-4 font-mono text-sm h-full overflow-auto">
        <div className="flex items-center gap-2 text-foreground/50">
          <div className="animate-spin w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full" />
          <span>Running R code...</span>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-[#1a1a2e] rounded-lg p-4 font-mono text-sm h-full overflow-auto">
        <p className="text-foreground/30 italic">
          Click &quot;Run Code&quot; to see output
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a2e] rounded-lg p-4 font-mono text-sm h-full overflow-auto space-y-1">
      {result.error && (
        <div className="text-error mb-2 p-2 bg-error/10 rounded">
          Error: {result.error}
        </div>
      )}
      {result.stderr.length > 0 && (
        <div className="text-warning/80">
          {result.stderr.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}
      {result.stdout.length > 0 && (
        <div className="text-foreground/90">
          {result.stdout.map((line, i) => (
            <pre key={i} className="whitespace-pre-wrap">{line}</pre>
          ))}
        </div>
      )}
      {!result.error && result.stdout.length === 0 && result.stderr.length === 0 && result.images.length === 0 && (
        <p className="text-foreground/30 italic">Code ran successfully (no output)</p>
      )}
    </div>
  );
}
