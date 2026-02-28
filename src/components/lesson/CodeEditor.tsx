'use client';

import dynamic from 'next/dynamic';
import { useCallback, useRef, useEffect } from 'react';
import type { editor } from 'monaco-editor';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  onRunSelection?: (code: string) => void;
  readOnly?: boolean;
  disableCopy?: boolean;
}

export default function CodeEditor({ code, onChange, onRunSelection, readOnly = false, disableCopy = false }: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const onRunSelectionRef = useRef(onRunSelection);

  // Keep ref in sync so the Monaco keybinding always calls the latest callback
  useEffect(() => {
    onRunSelectionRef.current = onRunSelection;
  }, [onRunSelection]);

  const handleEditorMount = useCallback(
    (editorInstance: editor.IStandaloneCodeEditor) => {
      editorRef.current = editorInstance;

      if (disableCopy) {
        editorInstance.addCommand(2048 | 33, () => {}); // Cmd+C
        editorInstance.addCommand(2048 | 52, () => {}); // Cmd+X
      }

      // Cmd+Enter: run selection or current line
      editorInstance.addCommand(2048 | 3, () => { // KeyMod.CtrlCmd | KeyCode.Enter
        if (!onRunSelectionRef.current) return;
        const selection = editorInstance.getSelection();
        const model = editorInstance.getModel();
        if (!model || !selection) return;

        const selectedText = model.getValueInRange(selection).trim();
        if (selectedText) {
          onRunSelectionRef.current(selectedText);
        } else {
          const line = selection.positionLineNumber;
          const lineContent = model.getLineContent(line).trim();
          if (lineContent && !lineContent.startsWith('#')) {
            onRunSelectionRef.current(lineContent);
          }
        }
      });
    },
    [disableCopy]
  );

  return (
    <div
      className="h-full"
      onContextMenu={disableCopy ? (e) => e.preventDefault() : undefined}
    >
      <Editor
        height="100%"
        defaultLanguage="r"
        value={code}
        onChange={(value) => onChange(value ?? '')}
        theme="vs-dark"
        onMount={handleEditorMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          padding: { top: 12 },
          readOnly,
          automaticLayout: true,
          tabSize: 2,
          renderWhitespace: 'none',
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false,
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
        }}
      />
    </div>
  );
}
