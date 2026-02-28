'use client';

import { WebRStatus } from '@/lib/webr/instance';

const STATUS_MESSAGES: Record<WebRStatus, string> = {
  uninitialized: 'Preparing...',
  loading: 'Starting R engine...',
  'installing-packages': 'Installing R packages (dplyr, readr, ggplot2)...',
  'loading-data': 'Loading NFL data...',
  ready: 'Ready!',
  error: 'Something went wrong',
};

const STATUS_PROGRESS: Record<WebRStatus, number> = {
  uninitialized: 0,
  loading: 20,
  'installing-packages': 50,
  'loading-data': 80,
  ready: 100,
  error: 0,
};

interface LoadingScreenProps {
  status: WebRStatus;
  error?: string | null;
  onRetry?: () => void;
}

export default function LoadingScreen({ status, error, onRetry }: LoadingScreenProps) {
  const progress = STATUS_PROGRESS[status];
  const message = STATUS_MESSAGES[status];

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="text-center max-w-md px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-accent mb-2">R Sports Lab</h1>
          <p className="text-foreground/60 text-sm">
            Interactive NFL Sports Modeling with R
          </p>
        </div>

        {status === 'error' ? (
          <div className="bg-error/10 border border-error/30 rounded-lg p-4">
            <p className="text-error font-medium mb-1">Failed to initialize</p>
            <p className="text-error/80 text-sm mb-4">{error || 'Unknown error'}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-background font-medium rounded transition-colors text-sm"
              >
                Retry
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="w-full bg-surface rounded-full h-2 mb-4 overflow-hidden">
              <div
                className="bg-accent h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-foreground/70 text-sm">{message}</p>
            {status !== 'ready' && (
              <p className="text-foreground/40 text-xs mt-3">
                First load may take 15-20 seconds
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
