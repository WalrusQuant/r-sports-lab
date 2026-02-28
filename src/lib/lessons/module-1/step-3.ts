import { LessonStep } from '../types';

const step3: LessonStep = {
  id: 'step-3',
  title: 'Standardize Team Names',

  previewInstructions: `
## What Are We Building?

NFL franchises occasionally pick up and move to a new city. When that happens, the team's abbreviation in the data changes — even though it's the same roster, coaching staff, and front office continuing from the season before. Our dataset covers three such moves in the window we care about:

- **St. Louis Rams** (STL) became the **Los Angeles Rams** (LA) in 2016
- **San Diego Chargers** (SD) became the **Los Angeles Chargers** (LAC) in 2017
- **Oakland Raiders** (OAK) became the **Las Vegas Raiders** (LV) in 2020

This is a modeling decision, not just a data cleaning step. We are choosing to treat these relocated teams as one continuous franchise — the same entity before and after the move. That means the Rams' 2015 and 2016 seasons should count toward the same rating. If we leave the abbreviations as-is, the model sees STL and LA as two completely separate teams with no shared history, which distorts the ratings badly for the first season after each relocation.

The code below defines a small helper function called \`standardize_team()\` that maps old abbreviations to current ones, then applies it to both the \`home_team\` and \`away_team\` columns simultaneously. The final line prints every unique home team abbreviation in alphabetical order so we can confirm that STL, SD, and OAK no longer appear.
`,

  solutionCode: `standardize_team <- function(team) {
  case_when(
    team == "STL" ~ "LA",
    team == "SD"  ~ "LAC",
    team == "OAK" ~ "LV",
    TRUE ~ team
  )
}

games_clean <- games_clean %>%
  mutate(
    home_team = standardize_team(home_team),
    away_team = standardize_team(away_team)
  )

sort(unique(games_clean$home_team))`,

  practiceInstructions: `
## Learning the Concepts

### \`mutate()\` — Creating and Modifying Columns

\`mutate()\` is used to add new columns to a data frame or to overwrite existing ones. It's one of the most frequently used functions in the tidyverse.

\`\`\`r
# Add a new column: point differential
games_clean %>%
  mutate(point_diff = home_score - away_score)

# Overwrite an existing column
games_clean %>%
  mutate(home_team = toupper(home_team))
\`\`\`

When you name a new column the same as an existing column, \`mutate()\` replaces it in place. You can also create or modify multiple columns in a single \`mutate()\` call by separating the assignments with commas — which is exactly what we do here to update both \`home_team\` and \`away_team\` at once.

### \`case_when()\` — Vectorized If/Else

\`case_when()\` is \`dplyr\`'s vectorized if/else chain. It evaluates each row against a series of conditions and returns the corresponding result for the first condition that is TRUE.

The syntax uses the \`~\` (tilde) operator to separate the condition from its result:

\`\`\`r
case_when(
  condition1 ~ result1,
  condition2 ~ result2,
  TRUE       ~ default_result
)
\`\`\`

Think of each line as: "**if** this condition is true, **then** return this value." The \`TRUE ~ team\` at the end is the catch-all "else" clause — because \`TRUE\` is always true, it matches any row that wasn't caught by a condition above it. Without that final line, rows that don't match any condition would return \`NA\` (R's missing value), which would silently corrupt your data.

**Why not just use \`ifelse()\`?** The base R function \`ifelse()\` only handles one condition at a time, so you'd have to nest them: \`ifelse(a, x, ifelse(b, y, ifelse(c, z, default)))\`. \`case_when()\` makes multi-condition logic flat and readable.

### Defining a Helper Function

Wrapping the \`case_when()\` logic in a named function serves two purposes. First, it makes the \`mutate()\` call cleaner — \`mutate(home_team = standardize_team(home_team))\` communicates intent more clearly than an inline \`case_when()\`. Second, it lets us apply the exact same transformation to both \`home_team\` and \`away_team\` without duplicating the logic, which means there's only one place to update if we ever need to add another relocation.

### Verifying the Result

After standardizing, we use \`sort(unique(games_clean$home_team))\` to print every distinct home team abbreviation in alphabetical order. The \`$\` operator extracts a single column as a plain vector. If STL, SD, or OAK still appear in that list, something went wrong in the function.

---

Now define the function and apply it yourself.
`,

  scaffoldCode: `# Define a function called standardize_team
# Hint: my_func <- function(x) { case_when(x == "old" ~ "new", TRUE ~ x) }
# Map: "STL" -> "LA", "SD" -> "LAC", "OAK" -> "LV"


# Apply standardize_team to both home_team and away_team
# Hint: data <- data %>% mutate(col = my_func(col))


# Verify: print all unique home team abbreviations in sorted order
# Hint: sort(unique(data$column))
`,

  setupCode: `suppressPackageStartupMessages({
  library(readr)
  library(dplyr)
})
if (!exists("games")) {
  games <- read_csv("/data/nfl_schedules.csv", show_col_types = FALSE)
}
if (!exists("games_clean")) {
  games_clean <- games %>%
    filter(game_type == "REG", season >= 2015) %>%
    select(season, week, home_team, away_team, home_score, away_score)
}`,
};

export default step3;
