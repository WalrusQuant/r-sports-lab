'use client';

import { use } from 'react';
import { useWebR } from '@/hooks/useWebR';
import { useLesson } from '@/hooks/useLesson';
import { useCodeExecution } from '@/hooks/useCodeExecution';
import Header from '@/components/layout/Header';
import StepNavigation from '@/components/lesson/StepNavigation';
import LessonLayout from '@/components/lesson/LessonLayout';
import LoadingScreen from '@/components/ui/LoadingScreen';
import module1 from '@/lib/lessons/module-1';
import module2 from '@/lib/lessons/module-2';
import module3 from '@/lib/lessons/module-3';
import { LessonModule } from '@/lib/lessons/types';

const MODULES: Record<string, LessonModule> = {
  'module-1': module1,
  'module-2': module2,
  'module-3': module3,
};

export default function LessonPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = use(params);
  const module = MODULES[moduleId];

  const { status, error, runCode, isReady, retry } = useWebR();
  const lesson = useLesson(module ?? module1);
  const { isRunning, result, execute, clearResult } = useCodeExecution(runCode);

  if (!module) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-error">Module not found: {moduleId}</p>
      </div>
    );
  }

  if (status !== 'ready') {
    return <LoadingScreen status={status} error={error} onRetry={retry} />;
  }

  const handleRun = () => {
    clearResult();
    execute(lesson.currentCode, lesson.currentStep.setupCode);
  };

  const handleRunSelection = (selectedCode: string) => {
    clearResult();
    execute(selectedCode, lesson.currentStep.setupCode);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header moduleTitle={module.title} />
      <StepNavigation
        currentStep={lesson.currentStepIndex}
        totalSteps={lesson.totalSteps}
        stepTitle={lesson.currentStep.title}
        phase={lesson.phase}
        onPrev={lesson.goToPrev}
        onNext={lesson.goToNext}
        canGoPrev={lesson.canGoPrev}
        isLast={lesson.isLastStep}
      />
      <div className="flex-1 overflow-hidden">
        <LessonLayout
          step={lesson.currentStep}
          code={lesson.currentCode}
          onCodeChange={lesson.setCode}
          onRun={handleRun}
          onRunSelection={handleRunSelection}
          onStartCoding={lesson.startCoding}
          isRunning={isRunning}
          result={result}
          isReady={isReady}
          phase={lesson.phase}
        />
      </div>
    </div>
  );
}
