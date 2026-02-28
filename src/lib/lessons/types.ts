export interface LessonStep {
  id: string;
  title: string;
  // Preview phase
  previewInstructions: string;  // What are we building? Why?
  solutionCode: string;         // Shown read-only in preview
  // Practice phase
  practiceInstructions: string; // Teach the R/tidyverse concepts
  scaffoldCode: string;         // Comments-only skeleton
  // Execution
  setupCode?: string;           // Runs silently before user code
}

export interface LessonModule {
  id: string;
  title: string;
  description: string;
  steps: LessonStep[];
}
