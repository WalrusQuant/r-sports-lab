'use client';

import { Panel, Group, Separator } from 'react-resizable-panels';
import InstructionPanel from './InstructionPanel';
import EditorPanel from './EditorPanel';
import { LessonStep } from '@/lib/lessons/types';
import { LessonPhase } from '@/hooks/useLesson';
import { ExecutionResult } from '@/lib/webr/executor';

interface LessonLayoutProps {
  step: LessonStep;
  code: string;
  onCodeChange: (code: string) => void;
  onRun: () => void;
  onRunSelection: (code: string) => void;
  onStartCoding: () => void;
  isRunning: boolean;
  result: ExecutionResult | null;
  isReady: boolean;
  phase: LessonPhase;
}

export default function LessonLayout({
  step,
  code,
  onCodeChange,
  onRun,
  onRunSelection,
  onStartCoding,
  isRunning,
  result,
  isReady,
  phase,
}: LessonLayoutProps) {
  const markdown = phase === 'preview'
    ? step.previewInstructions
    : step.practiceInstructions;

  return (
    <Group orientation="horizontal" className="h-full">
      <Panel defaultSize={40} minSize={25} className="bg-surface">
        <InstructionPanel markdown={markdown} />
      </Panel>

      <Separator className="w-1.5 bg-border hover:bg-accent/50 transition-colors" />

      <Panel defaultSize={60} minSize={30}>
        <EditorPanel
          code={code}
          solutionCode={step.solutionCode}
          onCodeChange={onCodeChange}
          onRun={onRun}
          onRunSelection={onRunSelection}
          onStartCoding={onStartCoding}
          isRunning={isRunning}
          result={result}
          isReady={isReady}
          phase={phase}
        />
      </Panel>
    </Group>
  );
}
