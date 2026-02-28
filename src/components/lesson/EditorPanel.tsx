'use client';

import { useState } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import CodeEditor from './CodeEditor';
import ConsoleOutput from './ConsoleOutput';
import PlotOutput from './PlotOutput';
import RunButton from './RunButton';
import { ExecutionResult } from '@/lib/webr/executor';
import { LessonPhase } from '@/hooks/useLesson';

interface EditorPanelProps {
  code: string;
  solutionCode: string;
  onCodeChange: (code: string) => void;
  onRun: () => void;
  onRunSelection: (code: string) => void;
  onStartCoding: () => void;
  isRunning: boolean;
  result: ExecutionResult | null;
  isReady: boolean;
  phase: LessonPhase;
}

export default function EditorPanel({
  code,
  solutionCode,
  onCodeChange,
  onRun,
  onRunSelection,
  onStartCoding,
  isRunning,
  result,
  isReady,
  phase,
}: EditorPanelProps) {
  const isPreview = phase === 'preview';
  const [peeking, setPeeking] = useState(false);

  // Reset peek when phase or step changes (React-recommended derived state pattern)
  const [trackedPhase, setTrackedPhase] = useState(phase);
  const [trackedSolution, setTrackedSolution] = useState(solutionCode);
  if (trackedPhase !== phase || trackedSolution !== solutionCode) {
    setTrackedPhase(phase);
    setTrackedSolution(solutionCode);
    if (peeking) setPeeking(false);
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface">
        <div className="flex items-center gap-3">
          <span className="text-sm text-foreground/50 font-mono">
            {isPreview ? 'preview.R' : peeking ? 'solution.R' : 'editor.R'}
          </span>
          {!isPreview && (
            <button
              onClick={() => setPeeking(!peeking)}
              className={`text-xs px-2 py-0.5 rounded transition-colors ${
                peeking
                  ? 'bg-accent/20 text-accent'
                  : 'text-foreground/40 hover:text-foreground/70'
              }`}
            >
              {peeking ? 'Back to Editor' : 'Peek Solution'}
            </button>
          )}
        </div>
        {isPreview ? (
          <button
            onClick={onStartCoding}
            className="px-4 py-1.5 text-sm rounded bg-accent hover:bg-accent-hover text-background font-medium transition-colors"
          >
            Start Coding
          </button>
        ) : (
          <RunButton onClick={onRun} isRunning={isRunning} disabled={!isReady || peeking} />
        )}
      </div>

      {/* Editor + Output split */}
      <Group orientation="vertical" className="flex-1">
        <Panel defaultSize={isPreview ? 100 : 55} minSize={20}>
          <div className="h-full flex flex-col">
            <div className="flex-1">
              {peeking ? (
                <CodeEditor
                  key="peek"
                  code={solutionCode}
                  onChange={() => {}}
                  readOnly
                />
              ) : isPreview ? (
                <CodeEditor
                  key="preview"
                  code={code}
                  onChange={onCodeChange}
                  readOnly
                  disableCopy
                />
              ) : (
                <CodeEditor
                  key="practice"
                  code={code}
                  onChange={onCodeChange}
                  onRunSelection={onRunSelection}
                />
              )}
            </div>
            {isPreview && (
              <div className="border-t border-border bg-surface px-4 py-4 flex items-center justify-between">
                <p className="text-sm text-foreground/60">
                  Read the code above, then try writing it yourself.
                </p>
                <button
                  onClick={onStartCoding}
                  className="px-5 py-2 text-sm rounded bg-accent hover:bg-accent-hover text-background font-semibold transition-colors"
                >
                  Start Coding
                </button>
              </div>
            )}
          </div>
        </Panel>

        {!isPreview && (
          <>
            <Separator className="h-1.5 bg-border hover:bg-accent/50 transition-colors" />
            <Panel defaultSize={45} minSize={15}>
              <div className="h-full flex flex-col overflow-auto p-3 gap-3">
                <ConsoleOutput result={result} isRunning={isRunning} />
                {result && result.images.length > 0 && (
                  <PlotOutput images={result.images} />
                )}
              </div>
            </Panel>
          </>
        )}
      </Group>
    </div>
  );
}
