'use client';

import { useState, useCallback } from 'react';
import { ExecutionResult } from '@/lib/webr/executor';

export function useCodeExecution(
  runCode: (code: string) => Promise<ExecutionResult>
) {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);

  const execute = useCallback(
    async (code: string, setupCode?: string) => {
      setIsRunning(true);
      setResult(null);

      try {
        // Run setup code first (silently) if provided
        if (setupCode) {
          const setupResult = await runCode(setupCode);
          if (setupResult.error) {
            setResult({
              stdout: [],
              stderr: [`Setup error: ${setupResult.error}`],
              images: [],
              error: setupResult.error,
            });
            return;
          }
        }

        // Run user code
        const execResult = await runCode(code);
        setResult(execResult);
      } catch (err) {
        setResult({
          stdout: [],
          stderr: [],
          images: [],
          error: err instanceof Error ? err.message : String(err),
        });
      } finally {
        setIsRunning(false);
      }
    },
    [runCode]
  );

  const clearResult = useCallback(() => setResult(null), []);

  return { isRunning, result, execute, clearResult };
}
