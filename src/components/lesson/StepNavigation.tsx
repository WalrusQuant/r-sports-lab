'use client';

import { LessonPhase } from '@/hooks/useLesson';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  phase: LessonPhase;
  onPrev: () => void;
  onNext: () => void;
  canGoPrev: boolean;
  isLast: boolean;
}

export default function StepNavigation({
  currentStep,
  totalSteps,
  stepTitle,
  phase,
  onPrev,
  onNext,
  canGoPrev,
  isLast,
}: StepNavigationProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface">
      {/* Left: Step info + phase indicator */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentStep
                  ? 'bg-accent'
                  : i < currentStep
                  ? 'bg-accent/40'
                  : 'bg-surface-light'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-foreground/70">
          Step {currentStep + 1}: {stepTitle}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          phase === 'preview'
            ? 'bg-accent/15 text-accent'
            : 'bg-success/15 text-success'
        }`}>
          {phase === 'preview' ? 'Preview' : 'Practice'}
        </span>
      </div>

      {/* Right: Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={!canGoPrev}
          className="px-3 py-1 text-sm rounded bg-surface-light hover:bg-surface-light/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Prev
        </button>
        <button
          onClick={onNext}
          disabled={isLast || phase === 'preview'}
          className="px-3 py-1 text-sm rounded bg-accent hover:bg-accent-hover text-background font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
