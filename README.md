# R Sports Lab

Learn to build NFL prediction models with R — right in your browser. No installs, no setup, just code.

R Sports Lab is an interactive learning platform that teaches sports modeling through hands-on R coding exercises powered by [WebR](https://docs.r-wasm.org/webr/latest/). Each lesson follows a two-phase approach: first preview a working solution, then practice writing it yourself with real-time feedback.

## Modules

| # | Module | What You'll Build | Steps |
|---|--------|-------------------|-------|
| 1 | **Data & Team Strengths** | Load NFL game data, clean it, and build offensive & defensive strength ratings for every team | 6 |
| 2 | **Bradley-Terry Ratings** | Fit a Bradley-Terry model to estimate team strength from win/loss outcomes, then evaluate with a train/test split | 6 |
| 3 | **Hybrid Models & Forecasting** | Combine Bradley-Terry ratings with strength metrics to predict spreads, win probabilities, and forecast a full week | 6 |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and pick a module to begin.

WebR downloads R packages on first load (~15-20 seconds). Subsequent visits use the browser cache.

## Tech Stack

- **[Next.js](https://nextjs.org) 16** — React framework with App Router
- **[WebR](https://docs.r-wasm.org/webr/latest/)** — R interpreter compiled to WebAssembly, runs entirely in the browser
- **[Monaco Editor](https://microsoft.github.io/monaco-editor/)** — VS Code's editor component with R syntax highlighting
- **[Tailwind CSS](https://tailwindcss.com) v4** — Styling with a custom dark theme
- **[react-resizable-panels](https://github.com/bvaughn/react-resizable-panels)** — Draggable split-pane layout

## Data

NFL game schedules (2006–present) sourced from [nflverse](https://github.com/nflverse/nfldata). To refresh the dataset:

```bash
Rscript scripts/prepare-data.R
```

## License

[AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.en.html)
