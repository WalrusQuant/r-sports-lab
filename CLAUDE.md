# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

R Sports Lab is an interactive browser-based learning platform that teaches NFL sports modeling with R. Students learn through a two-phase system (preview solution → practice writing code) using WebR to execute R directly in the browser. Built with Next.js 16, Monaco editor, and a declarative lesson system.

## Commands

- `npm run dev` — Start development server (localhost:3000, uses Turbopack)
- `npm run build` — Production build
- `npm run lint` — Run ESLint
- `Rscript scripts/prepare-data.R` — Regenerate NFL data from nflverse

No test framework is configured.

## Architecture

### Lesson System (Core Domain)

All lesson content lives in `src/lib/lessons/` as declarative TypeScript objects. Each module has N steps, each step defined in its own file (e.g., `module-1/step-1.ts`).

**LessonStep** (`src/lib/lessons/types.ts`) has two phases:
- **Preview**: `previewInstructions` (markdown) + `solutionCode` (read-only R code)
- **Practice**: `practiceInstructions` (markdown) + `scaffoldCode` (editable skeleton)
- **setupCode**: Runs silently before user code to establish context (load libraries, create variables from prior steps)

**Module registry**: Modules are imported in `src/app/lesson/[moduleId]/page.tsx` via a `MODULES` record keyed by module ID. The home page (`src/app/page.tsx`) also lists modules for the landing grid.

**To add a new module**: Create `src/lib/lessons/module-X/` with step files + `index.ts`, register in the `MODULES` object, and add a card to the home page.

### WebR Integration

Three files in `src/lib/webr/`:
- **instance.ts** — Singleton WebR initialization. Status progression: `uninitialized → loading → installing-packages → loading-data → ready`. Installs `dplyr`, `readr`, `ggplot2`. Fetches `public/data/nfl_schedules.csv` into the virtual filesystem.
- **executor.ts** — Runs R code via Shelter API. Returns `{ stdout, stderr, images, error }`. Renders plots to 504x504 canvas.
- **packages.ts** — Package installation utilities.

### Hooks

- **useWebR** (`src/hooks/useWebR.ts`) — WebR lifecycle, exposes `runCode` callback
- **useCodeExecution** (`src/hooks/useCodeExecution.ts`) — Manages execution state; runs optional `setupCode` silently then user code
- **useLesson** (`src/hooks/useLesson.ts`) — Step/phase navigation state machine. Next button disabled in preview phase. Phase-aware prev/next logic.

### Component Hierarchy

```
lesson/[moduleId]/page.tsx    ← Coordinates WebR + lesson state + execution
  ├── Header                  ← Logo + module title
  ├── StepNavigation          ← Progress dots + prev/next
  └── LessonLayout            ← Horizontal resizable split (react-resizable-panels)
       ├── InstructionPanel   ← Markdown rendering (react-markdown + remark-gfm)
       └── EditorPanel        ← Vertical split: editor + output
            ├── CodeEditor    ← Monaco editor (R syntax, Cmd+Enter to run)
            ├── ConsoleOutput ← stdout/stderr display
            └── PlotOutput    ← Canvas-rendered ggplot output
```

### Styling

Dark theme via CSS variables in `src/app/globals.css`. Tailwind CSS v4 with `@tailwindcss/typography` for markdown prose. Fonts: Geist Sans + Geist Mono via `next/font`.

Key colors: `--background: #0f172a`, `--accent: #38bdf8`, `--success: #4ade80`, `--error: #f87171`.

## Key Patterns

- **No state management library** — React hooks + props drilling only
- **Path alias**: `@/*` maps to `src/*`
- **WebR browser polyfills**: `next.config.ts` sets `fs`, `path`, `crypto` to `false` for client bundles
- **Lesson instructions are markdown strings** embedded in TypeScript — edit the `.ts` files directly, not separate `.md` files
- **setupCode chaining**: Each step's `setupCode` re-runs prior steps' solutions so variables are available (WebR doesn't persist state between executions)
