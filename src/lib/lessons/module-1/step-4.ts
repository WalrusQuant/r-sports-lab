import { LessonStep } from '../types';

const step4: LessonStep = {
  id: 'step-4',
  title: 'Reshape to Team-Games',
  previewInstructions: `
## Step 4: Reshape to Team-Games

Take a look at the code below. We're doing something that might seem simple at first, but it's one of the most important structural decisions in this entire model.

Right now, our data has **one row per game**. That's natural — a game happens, it gets a row. But our model doesn't care about games. It cares about *teams*. We want to answer questions like "how many points does the Chiefs score on average?" and "how many does their defense give up?" To do that, we need our data organized around team performances, not game outcomes.

The insight is this: **every game is actually two separate performances**. The home team had an offensive and defensive performance. So did the away team. One row-per-game collapses those two performances into a single record, which makes team-level analysis awkward. So we "unstack" it — we create one row for the home team's perspective and one row for the away team's perspective, then stack those two datasets on top of each other with \`bind_rows()\`.

After this reshape, the math for league-average PPG becomes clean and intuitive. We take the mean of \`points_scored\` across *all* team-game rows. Because every game contributes exactly two rows — one for each team — neither side is over- or under-represented. The result is a true league-wide average that we'll use as our baseline for every strength rating that follows.

Notice how \`select()\` is doing double duty here: it's both choosing which columns to keep *and* renaming them on the fly. The home perspective calls its \`home_score\` column \`points_scored\`, and the away perspective does the same with \`away_score\`. When we stack them, R sees two data frames with identical column names and merges them cleanly — no extra wrangling needed.
`,
  solutionCode: `# Create home-team perspective (home team scored home_score, allowed away_score)
home <- games_clean %>%
  select(
    season, week,
    team          = home_team,
    points_scored = home_score,
    points_allowed = away_score
  )

# Create away-team perspective (away team scored away_score, allowed home_score)
away <- games_clean %>%
  select(
    season, week,
    team          = away_team,
    points_scored = away_score,
    points_allowed = home_score
  )

# Stack both perspectives into one long dataset
team_games <- bind_rows(home, away)

# League-average PPG — equal weight for every team-game
league_avg <- mean(team_games$points_scored)

cat("League-average PPG:", round(league_avg, 1), "\\n")
cat("Total team-game rows:", nrow(team_games), "\\n")
cat("(Should be exactly 2x the number of games)")`,
  practiceInstructions: `
## Step 4: Reshape to Team-Games

### Wide vs. Long Data

This step introduces one of the most fundamental concepts in data analysis: **wide vs. long format**.

**Wide format** has one row per subject, with multiple columns for related measurements. Our current \`games_clean\` is wide — one row per game, with separate \`home_score\` and \`away_score\` columns. Wide data is easy to read in a spreadsheet, but it's hard to analyze when you need to treat those columns as equivalent values.

**Long format** has one row per observation. After our reshape, \`team_games\` is long — each team-game is its own row, with a single \`points_scored\` column. This is the format that dplyr's grouping and summarizing functions are designed to work with.

The rule of thumb: if you ever catch yourself writing \`(mean(home_score) + mean(away_score)) / 2\` to get an average across both teams, that's a sign your data needs to be reshaped to long format first.

### \`select()\` with Renaming

You already know \`select()\` for picking columns. It can also rename them in the same step:

\`\`\`r
# Old way: select then rename
df %>% select(home_team, home_score) %>% rename(team = home_team, points = home_score)

# New way: rename inside select
df %>% select(team = home_team, points = home_score)
\`\`\`

This is especially powerful here because we want two data frames that *look identical* (same column names, same column order) but pull from different source columns. Once they match structurally, \`bind_rows()\` can stack them.

### \`bind_rows()\` — Vertical Stacking

\`bind_rows(df1, df2)\` stacks two data frames on top of each other, matching columns by name. Think of it like SQL's \`UNION ALL\` — every row from \`df1\` is followed by every row from \`df2\`. If a column exists in one but not the other, the missing values are filled with \`NA\`.

The requirement is that the data frames have the same columns (or at least overlapping ones). That's exactly why we rename inside \`select()\` first — we're making both perspectives structurally identical so the stack is clean.

\`\`\`r
# After bind_rows(), our data looks like this:
# team  | points_scored | points_allowed
# KC    | 27            | 20            <- from a home game
# BUF   | 20            | 27            <- from that same game, away perspective
# KC    | 31            | 14            <- from a different game
# ...
\`\`\`

### Why the League Average Works Out Correctly

After stacking, \`mean(team_games$points_scored)\` gives us the true league-average PPG. This works because:

1. Every game produces exactly two rows — one per team
2. Both teams' scores are now in the same \`points_scored\` column
3. Taking the mean averages across all teams equally — no team is counted more than any other

If we had used \`(mean(games_clean$home_score) + mean(games_clean$away_score)) / 2\` instead, we'd get the same number here, but the long-format approach is far more scalable. When you add more calculations later, you only need to work with one column.

### Your Task

1. Create a \`home\` data frame selecting the home team's perspective (rename columns appropriately)
2. Create an \`away\` data frame selecting the away team's perspective
3. Stack them with \`bind_rows()\` into \`team_games\`
4. Calculate \`league_avg\` as the mean of \`points_scored\`
5. Print both values with \`cat()\`
`,
  scaffoldCode: `# Create the home-team perspective
# Hint: select() can rename: select(new_name = old_name)
# Need: season, week, team (from home_team), points_scored (from home_score), points_allowed (from away_score)


# Create the away-team perspective
# Need: season, week, team (from away_team), points_scored (from away_score), points_allowed (from home_score)


# Stack both into one dataset
# Hint: combined <- bind_rows(df1, df2)


# Calculate the league-average points per game
# Hint: avg <- mean(data$column)


# Print results
cat("League-average PPG:", round(league_avg, 1), "\\n")
cat("Total team-game rows:", nrow(team_games))`,
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
    mutate(
      home_team = standardize_team(home_team),
      away_team = standardize_team(away_team)
    )
}`,
};

export default step4;
