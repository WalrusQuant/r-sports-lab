import Link from 'next/link';

const modules = [
  {
    id: 'module-1',
    title: 'Data & Team Strengths',
    description:
      'Load NFL game data, clean it up, and build offensive & defensive strength ratings for every team.',
    steps: 6,
  },
  {
    id: 'module-2',
    title: 'Bradley-Terry Ratings',
    description:
      'Fit a Bradley-Terry model to estimate team strength from win/loss outcomes, then evaluate it with a train/test split.',
    steps: 6,
  },
  {
    id: 'module-3',
    title: 'Hybrid Models & Forecasting',
    description:
      'Combine Bradley-Terry ratings with offensive/defensive strength to predict spreads and win probabilities, then forecast a full week.',
    steps: 6,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-xl px-6">
        <h1 className="text-4xl font-bold text-accent mb-4">R Sports Lab</h1>
        <p className="text-foreground/60 mb-10 text-lg">
          Learn to build NFL sports models with R — right in your browser.
          No installs, no setup, just code.
        </p>

        <div className="space-y-4 text-left">
          {modules.map((mod, i) => (
            <div
              key={mod.id}
              className="bg-surface border border-border rounded-xl p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">
                    Module {i + 1}: {mod.title}
                  </h2>
                  <p className="text-sm text-foreground/50 mb-4">
                    {mod.description}
                  </p>
                </div>
                <Link
                  href={`/lesson/${mod.id}`}
                  className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-background font-semibold rounded-lg transition-colors text-sm"
                >
                  Start
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
              <p className="text-foreground/30 text-xs">
                {mod.steps} steps
              </p>
            </div>
          ))}
        </div>

        <p className="text-foreground/30 text-xs mt-8">
          18 interactive steps &middot; Powered by WebR
        </p>
      </div>
    </div>
  );
}
