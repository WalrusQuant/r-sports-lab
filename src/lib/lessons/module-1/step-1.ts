import { LessonStep } from '../types';

const step1: LessonStep = {
  id: 'step-1',
  title: 'Load the Data',

  previewInstructions: `
## What Are We Building?

Every data modeling project starts the same way: you open the raw data and try to understand what you're working with before you do anything else. This step is that moment.

We're loading 20 years of NFL game results — every regular season game from 2006 through the present, including the teams, scores, week number, and season year. This single file is the foundation for everything that follows. Before we can build a team strength model, we need to know the shape of the data: how many rows, what columns exist, what types those columns are, and whether anything looks unexpected.

The two lines of code below do exactly that. We load two libraries from the tidyverse, read the file into memory, and then call \`glimpse()\` to get an instant structural overview. Notice that the library loading is wrapped in \`suppressPackageStartupMessages()\` — this is a common tidyverse pattern that keeps the console clean by silencing the verbose output R prints when you attach a package.

Take a look at the output of \`glimpse()\`. You'll see the column names across the left, the data type in angle brackets (like \`<chr>\` for character or \`<dbl>\` for double/numeric), and the first few values from each column. This is your map of the territory before you start working.
`,

  solutionCode: `suppressPackageStartupMessages({
  library(readr)
  library(dplyr)
})

games <- read_csv("/data/nfl_schedules.csv", show_col_types = FALSE)

glimpse(games)`,

  practiceInstructions: `
## Learning the Concepts

### \`read_csv()\` vs \`read.csv()\`

R has two ways to read a CSV file. The base R function is \`read.csv()\` (with a dot). The tidyverse function is \`read_csv()\` (with an underscore). You should always prefer \`read_csv()\` when working in the tidyverse for several reasons:

- It's significantly faster on large files
- It returns a **tibble** instead of a plain data frame (more on that below)
- It prints helpful diagnostics about column types when loading
- It uses more sensible defaults (no automatic factor conversion, no row names)

The \`show_col_types = FALSE\` argument we pass tells \`read_csv()\` not to print the column type summary — we're using \`glimpse()\` for that instead.

### What Is a Tibble?

A tibble is the tidyverse's improved version of R's base data frame. It holds the same kind of tabular data (rows and columns), but it has better default printing behavior — it shows only the first 10 rows and as many columns as fit on screen, rather than dumping everything at once. It also never silently converts strings to factors, which was a notorious source of bugs in older R code.

For practical purposes you can treat a tibble exactly like a data frame. Everything you know about data frames works on tibbles.

### What Does \`glimpse()\` Tell You?

\`glimpse()\` from the \`dplyr\` package gives you a transposed view of the data frame — the columns run down the page instead of across it. For each column you see:

- The **column name**
- The **data type** in angle brackets: \`<chr>\` (text), \`<dbl>\` (decimal number), \`<int>\` (integer), \`<lgl>\` (TRUE/FALSE)
- The **first several values** from that column

This is the fastest way to answer "what is in this dataset?" and it's the first thing most R practitioners do when encountering new data.

### Why Suppress Package Messages?

When you call \`library(dplyr)\`, R prints several lines about the package version and any functions that conflict with other packages. That output is useful once, but it's noise in a learning environment. Wrapping multiple library calls in \`suppressPackageStartupMessages({}))\` is idiomatic tidyverse style — it signals "I know what I'm loading, quiet please."

---

Now it's your turn. Use the concepts above to load the libraries, read the file, and inspect the result.
`,

  scaffoldCode: `# Load the readr and dplyr libraries
# Hint: suppressPackageStartupMessages({ library(pkg1); library(pkg2) })


# Read the CSV file at "/data/nfl_schedules.csv" into a variable called games
# Hint: variable <- read_csv("path", show_col_types = FALSE)


# Inspect the structure of games
# Hint: glimpse(variable)
`,
};

export default step1;
