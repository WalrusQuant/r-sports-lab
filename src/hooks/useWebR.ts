'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { WebR } from 'webr';
import { initWebR, getWebR, resetWebR, WebRStatus } from '@/lib/webr/instance';
import { executeR, ExecutionResult } from '@/lib/webr/executor';

export function useWebR() {
  const [status, setStatus] = useState<WebRStatus>('uninitialized');
  const [error, setError] = useState<string | null>(null);
  const webRRef = useRef<WebR | null>(null);

  const startInit = useCallback(() => {
    setError(null);
    setStatus('uninitialized');

    initWebR((newStatus) => {
      setStatus(newStatus);
    })
      .then((webR) => {
        webRRef.current = webR;
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err));
        setStatus('error');
      });
  }, []);

  useEffect(() => {
    startInit();
  }, [startInit]);

  const retry = useCallback(() => {
    resetWebR();
    startInit();
  }, [startInit]);

  const runCode = useCallback(
    async (code: string): Promise<ExecutionResult> => {
      const webR = webRRef.current || getWebR();
      if (!webR) {
        return {
          stdout: [],
          stderr: [],
          images: [],
          error: 'WebR is not initialized',
        };
      }
      return executeR(webR, code);
    },
    []
  );

  return { status, error, runCode, isReady: status === 'ready', retry };
}
