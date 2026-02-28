'use client';

import { useState, useCallback } from 'react';
import { LessonModule, LessonStep } from '@/lib/lessons/types';

export type LessonPhase = 'preview' | 'practice';

export function useLesson(module: LessonModule) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [phase, setPhase] = useState<LessonPhase>('preview');
  const [codePerStep, setCodePerStep] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    module.steps.forEach((step) => {
      initial[step.id] = step.scaffoldCode;
    });
    return initial;
  });

  const currentStep: LessonStep = module.steps[currentStepIndex];
  const totalSteps = module.steps.length;

  const currentCode = phase === 'preview'
    ? currentStep.solutionCode
    : (codePerStep[currentStep.id] ?? currentStep.scaffoldCode);

  const setCode = useCallback(
    (code: string) => {
      setCodePerStep((prev) => ({ ...prev, [currentStep.id]: code }));
    },
    [currentStep.id]
  );

  const startCoding = useCallback(() => {
    setPhase('practice');
  }, []);

  // Next: only works in practice phase, advances to next step's preview
  const goToNext = useCallback(() => {
    setCurrentStepIndex((prev) => Math.min(prev + 1, totalSteps - 1));
    setPhase('preview');
  }, [totalSteps]);

  // Prev behavior depends on phase:
  //   Practice → go back to current step's preview (re-read the solution)
  //   Preview  → go to previous step's preview
  const goToPrev = useCallback(() => {
    if (phase === 'practice') {
      setPhase('preview');
    } else {
      setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
    }
  }, [phase]);

  const goToStep = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalSteps) {
        setCurrentStepIndex(index);
        setPhase('preview');
      }
    },
    [totalSteps]
  );

  // Prev disabled only when on first step AND in preview phase
  const canGoPrev = !(currentStepIndex === 0 && phase === 'preview');

  return {
    currentStep,
    currentStepIndex,
    totalSteps,
    currentCode,
    phase,
    setCode,
    startCoding,
    goToNext,
    goToPrev,
    goToStep,
    canGoPrev,
    isLastStep: currentStepIndex === totalSteps - 1,
  };
}
