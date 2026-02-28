import { LessonStep } from '../types';

const step2: LessonStep = {
  id: 'step-2',
  title: 'Filter & Select',

  previewInstructions: `
## What Are We Building?

Real-world datasets almost always contain more than you need. The raw NFL schedule file has columns for stadium location, weather conditions, referees, betting lines, and much more. Our strength model only needs to know who played, what season and week it was, and what the final scores were. Working with unnecessary columns just adds noise — so we cut them out early.

We also need to be selective about which rows we keep. The dataset includes playoff games, Pro Bowl games, and preseason games. We want only regular season games, because those are the games that establish a team's true season-long performance. We also limit to 2015 and later — this gives us roughly a decade of data with stable, consistent team abbreviations and a manageable window for a strength rating.

The code below does both jobs in a single pipeline. Read it top to bottom: we start with \`games\`, filter down to just regular season games from 2015 onward, then select only the six columns we care about. The result, \`games_clean\`, is what we'll carry through the rest of the module.

Notice how the pipeline reads almost like an English sentence: "Take games, then keep only REG games from 2015+, then keep only these six columns." That readability is one of the core design goals of the tidyverse pipe operator.
`,

  solutionCode: `games_clean <- games %>%
  filter(game_type == "REG", season >= 2015) %>%
  select(season, week, home_team, away_team, home_score, away_score)

head(games_clean, 10)
cat("\\nTotal games:", nrow(games_clean))`,

  practiceInstructions: `
## Learning the Concepts

### The Pipe Operator: \`%>%\`

The pipe is one of the most important ideas in the tidyverse. It takes the output of one expression and passes it as the **first argument** to the next function. Think of it as saying "and then do this."

\`\`\`r
# Without the pipe — hard to read
select(filter(games, season >= 2015), home_team, away_team)

# With the pipe — reads left to right, top to bottom
games %>%
  filter(season >= 2015) %>%
  select(home_team, away_team)
\`\`\`

Both of those produce identical results. The pipe version is easier to read, easier to modify, and easier to debug because you can comment out any step and check the intermediate result.

> **Note:** In newer versions of R (4.1+) there is a built-in pipe operator \`|>\` that works almost identically. You'll see both in the wild. We use \`%>%\` from the \`magrittr\`/\`dplyr\` package throughout this module.

### \`filter()\` — The SQL WHERE Clause

\`filter()\` keeps only the rows where a condition is TRUE. It's the direct equivalent of SQL's \`WHERE\` clause.

\`\`\`r
# Keep only rows where game_type is exactly "REG"
filter(games, game_type == "REG")

# Multiple conditions separated by commas are AND by default
filter(games, game_type == "REG", season >= 2015)
\`\`\`

When you separate conditions with a comma, **both must be true** for a row to be kept. If you want OR logic instead, use \`|\` explicitly: \`filter(games, season == 2015 | season == 2016)\`.

### \`select()\` — The SQL SELECT Clause

\`select()\` keeps only the columns you name. It's the equivalent of writing \`SELECT col1, col2 FROM ...\` in SQL.

\`\`\`r
# Keep only these six columns
select(games, season, week, home_team, away_team, home_score, away_score)
\`\`\`

You can also use \`select()\` to drop columns with a minus sign (\`select(-column_to_drop)\`), or to reorder columns. For now, listing the columns you want is the clearest approach.

### Checking Your Work

Two functions help you verify the pipeline produced what you expected:

- \`head(df, n)\` — shows the first \`n\` rows (default 6)
- \`nrow(df)\` — returns the total number of rows as a number

---

Now build the pipeline yourself using the concepts above.
`,

  scaffoldCode: `# Create games_clean by piping games through filter() and select()
# Hint: result <- data %>% filter(col == "value", col >= number) %>% select(col1, col2)
# Filter to: game_type == "REG" and season >= 2015
# Select: season, week, home_team, away_team, home_score, away_score


# Print the first 10 rows
# Hint: head(data, 10)


# Print the total number of games
# Hint: cat("\\nTotal games:", nrow(data))
`,

  setupCode: `suppressPackageStartupMessages({
  library(readr)
  library(dplyr)
})
if (!exists("games")) {
  games <- read_csv("/data/nfl_schedules.csv", show_col_types = FALSE)
}`,
};

export default step2;
