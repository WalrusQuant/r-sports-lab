import { LessonStep } from '../types';

const step1: LessonStep = {
  id: 'step-1',
  title: 'Game-Level Features',

  previewInstructions: `
## What Are We Building?

In Module 1 we built team-level strength ratings — a single offensive and defensive number for each franchise. Those are useful summaries, but they live at the *team* level. To build a prediction model, we need features at the *game* level — one row per matchup with everything the model needs to make a prediction.

This step transforms \`games_clean\` into \`model_data\` by adding three things:

1. **\`h_mov\`** (home margin of victory) — the difference \`home_score - away_score\`. Positive means the home team won. This is the target variable for our spread model later.
2. **\`h_win\`** — a binary indicator: 1 if the home team won, 0 otherwise. This is the target for the Bradley-Terry model and the win probability model.
3. **Team strength features** — we join \`team_strength\` twice to attach each team's offensive and defensive strength to every game. The home team's ratings become \`home_os\` and \`home_ds\`; the away team's become \`away_os\` and \`away_ds\`.

The double \`left_join()\` pattern is worth studying carefully. We're joining the same table (\`team_strength\`) to the same data frame (\`model_data\`) twice, but on different key columns each time — first matching \`home_team\` to \`team\`, then matching \`away_team\` to \`team\`. Each join renames the columns to avoid conflicts. This is a common pattern whenever your data has two entities per row (home/away, buyer/seller, source/destination) and you need attributes for both.
`,

  solutionCode: `# Add home margin of victory and win indicator
model_data <- games_clean %>%
  mutate(
    h_mov = home_score - away_score,
    h_win = as.integer(h_mov > 0)
  )

# Join home team's offensive/defensive strength
model_data <- model_data %>%
  left_join(
    team_strength %>% select(team, home_os = off_strength, home_ds = def_strength),
    by = c("home_team" = "team")
  ) %>%
  left_join(
    team_strength %>% select(team, away_os = off_strength, away_ds = def_strength),
    by = c("away_team" = "team")
  )

head(model_data)
cat("\\nRows:", nrow(model_data), "| Columns:", ncol(model_data))`,

  practiceInstructions: `
## Learning the Concepts

### \`mutate()\` with Derived Columns

You've used \`mutate()\` to overwrite columns (standardizing team names). It's equally useful for creating *new* columns from existing ones:

\`\`\`r
# Create a new column from arithmetic on existing columns
games_clean %>%
  mutate(point_diff = home_score - away_score)
\`\`\`

You can reference a column you just created in the same \`mutate()\` call — R evaluates them in order:

\`\`\`r
games_clean %>%
  mutate(
    h_mov = home_score - away_score,   # created first
    h_win = as.integer(h_mov > 0)      # uses h_mov
  )
\`\`\`

### \`as.integer()\` for Boolean-to-Binary Conversion

In R, comparisons like \`h_mov > 0\` produce logical values (\`TRUE\`/\`FALSE\`). Many modeling functions need numeric 0/1 instead. \`as.integer()\` converts \`TRUE\` to \`1\` and \`FALSE\` to \`0\`:

\`\`\`r
as.integer(TRUE)   # 1
as.integer(FALSE)  # 0
as.integer(c(3, -1, 7) > 0)  # c(1, 0, 1)
\`\`\`

This is a common data preparation step — converting a human-readable condition into a machine-readable target variable.

### Double \`left_join()\` with Column Renaming

When your data has two entities per row (home team and away team), you often need to join the same reference table twice — once for each entity. The trick is renaming the joined columns to distinguish them:

\`\`\`r
# First join: attach home team's ratings
model_data %>%
  left_join(
    team_strength %>% select(team, home_os = off_strength, home_ds = def_strength),
    by = c("home_team" = "team")
  )
\`\`\`

The \`select(team, home_os = off_strength)\` renames \`off_strength\` to \`home_os\` *before* the join, so the result has clearly named columns. The \`by = c("home_team" = "team")\` syntax means "match \`home_team\` in the left table to \`team\` in the right table." After the first join, you chain a second join matching \`away_team\` instead.

### Why Game-Level Features Matter

Machine learning models need a flat table where every row is one observation and every column is a feature. Our observation unit is a game, and our features include:
- **Target variables**: \`h_mov\` (continuous) and \`h_win\` (binary)
- **Predictor features**: \`home_os\`, \`home_ds\`, \`away_os\`, \`away_ds\`

With this structure, we can pass \`model_data\` directly into \`lm()\`, \`glm()\`, or any other R modeling function.

---

Now build \`model_data\` yourself using the concepts above.
`,

  scaffoldCode: `# Add h_mov (home margin of victory) and h_win (1 if home won, 0 otherwise)
# Hint: data %>% mutate(new_col = col1 - col2, flag = as.integer(new_col > 0))


# Join home team's strength ratings (rename to home_os, home_ds)
# Hint: data %>% left_join(table %>% select(key, new_name = old_name), by = c("left_key" = "key"))


# Join away team's strength ratings (rename to away_os, away_ds)
# Same pattern, but match away_team to team


# Inspect the result
head(model_data)
cat("\\nRows:", nrow(model_data), "| Columns:", ncol(model_data))`,

  setupCode: `suppressPackageStartupMessages({
  library(readr)
  library(dplyr)
})
if (!exists("games")) {
  games <- read_csv("/data/nfl_schedules.csv", show_col_types = FALSE)
}
if (!exists("games_clean")) {
  standardize_team <- function(team) {
    case_when(team == "STL" ~ "LA", team == "SD" ~ "LAC", team == "OAK" ~ "LV", TRUE ~ team)
  }
  games_clean <- games %>%
    filter(game_type == "REG", season >= 2015) %>%
    select(season, week, home_team, away_team, home_score, away_score) %>%
    mutate(home_team = standardize_team(home_team), away_team = standardize_team(away_team))
}
if (!exists("team_games")) {
  team_games <- bind_rows(
    games_clean %>% select(season, week, team = home_team, points_scored = home_score, points_allowed = away_score),
    games_clean %>% select(season, week, team = away_team, points_scored = away_score, points_allowed = home_score)
  )
}
if (!exists("league_avg")) {
  league_avg <- mean(team_games$points_scored)
}
if (!exists("offense")) {
  offense <- team_games %>%
    group_by(team) %>%
    summarize(avg_scored = mean(points_scored), off_strength = mean(points_scored) / league_avg, .groups = "drop") %>%
    arrange(desc(off_strength))
}
if (!exists("defense")) {
  defense <- team_games %>%
    group_by(team) %>%
    summarize(avg_allowed = mean(points_allowed), def_strength = mean(points_allowed) / league_avg, .groups = "drop")
}
if (!exists("team_strength")) {
  team_strength <- offense %>% left_join(defense, by = "team")
}`,
};

export default step1;
