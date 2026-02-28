'use client';

import { useState, useCallback } from 'react';
import { ExecutionResult } from '@/lib/webr/executor';

export function useCodeExecution(
  runCode: (code: string) => Promise<ExecutionResult>
) {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);

  const execute = useCallback(
    async (code: string, setupCode?: string): Promise<ExecutionResult | null> => {
      setIsRunning(true);
      setResult(null);

      try {
        // Run setup code first (silently) if provided
        if (setupCode) {
          const setupResult = await runCode(setupCode);
          if (setupResult.error) {
            const errorResult: ExecutionResult = {
              stdout: [],
              stderr: [`Setup error: ${setupResult.error}`],
              images: [],
              error: setupResult.error,
            };
            setResult(errorResult);
            return errorResult;
          }
        }

        // Run user code
        const execResult = await runCode(code);
        setResult(execResult);
        return execResult;
      } catch (err) {
        const errorResult: ExecutionResult = {
          stdout: [],
          stderr: [],
          images: [],
          error: err instanceof Error ? err.message : String(err),
        };
        setResult(errorResult);
        return errorResult;
      } finally {
        setIsRunning(false);
      }
    },
    [runCode]
  );

  const clearResult = useCallback(() => setResult(null), []);

  return { isRunning, result, execute, clearResult };
}
