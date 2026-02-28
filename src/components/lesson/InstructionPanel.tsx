'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface InstructionPanelProps {
  markdown: string;
}

export default function InstructionPanel({ markdown }: InstructionPanelProps) {
  return (
    <div className="h-full overflow-auto p-6">
      <div className="prose prose-invert prose-sm max-w-none
        prose-headings:text-accent prose-headings:font-bold
        prose-h2:text-xl prose-h2:mt-0 prose-h2:mb-4
        prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2
        prose-p:text-foreground/80 prose-p:leading-relaxed
        prose-code:text-accent prose-code:bg-surface-light prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-surface-light prose-pre:border prose-pre:border-border
        prose-strong:text-foreground
        prose-li:text-foreground/80
        prose-blockquote:border-accent prose-blockquote:text-foreground/70
        prose-ul:my-2 prose-ol:my-2
        prose-table:text-foreground/80
        prose-th:text-foreground prose-th:border-border
        prose-td:border-border
      ">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </div>
    </div>
  );
}
