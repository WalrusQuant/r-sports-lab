import { LessonStep } from '../types';

const step5: LessonStep = {
  id: 'step-5',
  title: 'Offensive Strength',
  previewInstructions: `
## Step 5: Offensive Strength Rating

Here's the code that produces our first real insight: a ranked list of every NFL team's offensive strength, expressed as a ratio relative to the league average.

The formula is straightforward — **Offensive Strength = Team Avg PPG / League Avg PPG** — but the *interpretation* is what makes it powerful. A team that scores 28 points per game doesn't tell you much on its own. Is 28 good? Mediocre? It depends entirely on the era and the league. A team scoring 28 PPG in 2000 was a scoring machine; in 2023, it's roughly average. By dividing by the league average, we make the number context-free and comparable across seasons.

The ratio has a clean, intuitive meaning: **1.0 is exactly league average**. A team at 1.2 scores 20% more than the average team. A team at 0.85 scores 15% less. You can immediately compare any two teams — or the same team across different years — without needing to remember what era they played in.

This ratio approach is a foundational technique in sports analytics (and in statistics generally). You'll see it show up in win probability models, Vegas spreads, and power rankings across every sport. We're building the same machinery from scratch, which is why understanding the "why" here matters more than the code itself.

The \`group_by() + summarize()\` pattern that makes this possible is the single most useful operation in the entire tidyverse. Once you understand it, you'll find yourself reaching for it constantly.
`,
  solutionCode: `# Group by team and calculate average points scored + offensive strength ratio
offense <- team_games %>%
  group_by(team) %>%
  summarize(
    avg_scored   = mean(points_scored),
    off_strength = mean(points_scored) / league_avg,
    .groups = "drop"
  ) %>%
  arrange(desc(off_strength))

# Print the top 10 offenses
print(offense %>% head(10))`,
  practiceInstructions: `
## Step 5: Offensive Strength Rating

### The Most Important Pattern in dplyr: Split-Apply-Combine

\`group_by() + summarize()\` is the most powerful operation in dplyr — arguably in all of data analysis. It implements what statisticians call the **split-apply-combine** strategy:

1. **Split** the data into groups (one group per unique team name)
2. **Apply** a function to each group independently (calculate mean points scored)
3. **Combine** the results back into a single data frame

\`\`\`r
team_games %>%
  group_by(team) %>%       # Split: create one "bucket" per team
  summarize(               # Apply + Combine: compute stats, then stack results
    avg_scored = mean(points_scored)
  )
\`\`\`

Without \`group_by()\`, \`summarize()\` collapses the entire data frame to a single row — the overall average across every game. With \`group_by(team)\`, it produces one row *per team*, each with that team's average. This distinction is critical.

The SQL equivalent would be: \`SELECT team, AVG(points_scored) FROM team_games GROUP BY team\`. If you know SQL, the mental model transfers directly.

### What \`.groups = "drop"\` Does

After \`summarize()\`, dplyr has a choice: keep the data grouped (since it still knows which team each row belongs to) or ungroup it. By default, dplyr drops the last grouping variable and keeps any outer ones. The \`.groups = "drop"\` argument tells dplyr to fully ungroup the result.

Why does this matter? If you accidentally leave a grouped data frame and pipe it into another operation later, you'll get per-group behavior when you expected whole-data behavior. This produces subtle, hard-to-debug errors. The habit of always adding \`.groups = "drop"\` prevents an entire category of mistakes.

\`\`\`r
# Without .groups = "drop", subsequent operations behave unexpectedly
offense_grouped <- team_games %>%
  group_by(team) %>%
  summarize(avg_scored = mean(points_scored))  # Still grouped!

# "drop" ensures the output is a plain, ungrouped data frame
offense_clean <- team_games %>%
  group_by(team) %>%
  summarize(avg_scored = mean(points_scored), .groups = "drop")  # Safe
\`\`\`

### \`arrange(desc())\` — Sorting

\`arrange(col)\` sorts ascending by default (lowest first). \`arrange(desc(col))\` reverses that, putting the highest value first. When ranking teams, you almost always want descending order — the best teams at the top.

\`\`\`r
# Ascending (default) — weakest first
offense %>% arrange(off_strength)

# Descending — strongest first
offense %>% arrange(desc(off_strength))
\`\`\`

### Interpreting the Strength Ratio

The \`off_strength\` column you'll produce means:

| Value | Meaning |
|-------|---------|
| 1.0 | Exactly league average |
| 1.2 | Scores 20% more than average |
| 0.8 | Scores 20% less than average |

The **league average is always 1.0 by construction** — because when you average the ratios across all teams, the league averages out to exactly 1.0. This makes the numbers self-calibrating: you never need to re-interpret them as the league's scoring environment changes year to year.

### Your Task

1. Start with \`team_games\`
2. Group by \`team\`
3. Summarize to get \`avg_scored\` (mean of \`points_scored\`) and \`off_strength\` (that average divided by \`league_avg\`)
4. Drop the grouping with \`.groups = "drop"\`
5. Sort in descending order of \`off_strength\`
6. Print the top 10 rows
`,
  scaffoldCode: `# Calculate offensive strength per team
# Hint: data %>% group_by(col) %>% summarize(new = mean(col), .groups = "drop")
#   avg_scored = mean of points_scored
#   off_strength = avg_scored / league_avg
# Then sort strongest to weakest
# Hint: arrange(desc(col))


# Print the top 10 offenses
# Hint: print(data %>% head(10))`,
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
}
if (!exists("team_games")) {
  team_games <- bind_rows(
    games_clean %>% select(season, week, team = home_team, points_scored = home_score, points_allowed = away_score),
    games_clean %>% select(season, week, team = away_team, points_scored = away_score, points_allowed = home_score)
  )
  league_avg <- mean(team_games$points_scored)
}
if (!exists("league_avg")) {
  league_avg <- mean(team_games$points_scored)
}`,
};

export default step5;
