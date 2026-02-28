import { LessonStep } from '../types';

const step6: LessonStep = {
  id: 'step-6',
  title: 'Defense & Visualization',
  previewInstructions: `
## Step 6: Defensive Strength & Visualization

This is the payoff step. The code below finishes our team strength model and produces a scatter plot showing every NFL team's offensive and defensive rating on a single chart.

Defensive strength is calculated the same way as offensive — average a team's \`points_allowed\` and divide by the league average. The key difference in interpretation is that **for defense, lower is better**. A defensive strength of 0.85 means the team allows 15% fewer points than average — that's elite. A value above 1.0 means the team's defense gives up more than a typical opponent. Keeping this asymmetry in mind (higher = better offense, lower = better defense) is important when reading the chart.

After computing defense, we use \`left_join()\` to merge the offensive and defensive ratings into a single \`team_strength\` table — one row per team, with both ratings side by side. This is the table that feeds directly into the plot.

The scatter plot is where everything becomes visual and intuitive. Each dot is a team, positioned by its offensive strength (x-axis) and defensive strength (y-axis). The two dashed lines at 1.0 divide the chart into four quadrants that tell a clear story: **top-right teams have strong offense and weak defense** (they win shootouts but can't stop anyone); **bottom-left teams have weak offense and strong defense** (they grind out low-scoring wins); **bottom-right is elite** (strong on both sides); **top-left is rebuilding** (struggling on both sides). The best franchises over this period will cluster in the bottom-right corner.

The ggplot2 code is more verbose than what you've written in earlier steps, but every line has a purpose. We'll break down each layer in the practice phase.
`,
  solutionCode: `suppressPackageStartupMessages(library(ggplot2))

# Calculate defensive strength (lower is better)
defense <- team_games %>%
  group_by(team) %>%
  summarize(
    avg_allowed  = mean(points_allowed),
    def_strength = mean(points_allowed) / league_avg,
    .groups = "drop"
  )

# Merge offense and defense into one table
team_strength <- offense %>%
  left_join(defense, by = "team")

# Scatter plot: every team's offense vs defense
ggplot(team_strength, aes(x = off_strength, y = def_strength)) +
  geom_point(color = "#38bdf8", size = 3) +
  geom_text(aes(label = team), vjust = -0.8, size = 2.5, color = "gray30") +
  geom_hline(yintercept = 1, linetype = "dashed", color = "gray50") +
  geom_vline(xintercept = 1, linetype = "dashed", color = "gray50") +
  labs(
    title = "NFL Team Strength (2015–present)",
    x     = "Offensive Strength (higher = better)",
    y     = "Defensive Strength (lower = better)"
  ) +
  theme_minimal() +
  theme(plot.title = element_text(face = "bold"))`,
  practiceInstructions: `
## Step 6: Defensive Strength & Visualization

### \`left_join()\` — Merging Two Tables

\`left_join(x, y, by = "col")\` merges two data frames by matching rows that share the same value in a key column. The "left" part means: **keep every row from the left table** (\`x\`), and attach matching columns from the right table (\`y\`). If a row in \`x\` has no match in \`y\`, the new columns are filled with \`NA\`.

\`\`\`r
# offense has: team, avg_scored, off_strength
# defense has: team, avg_allowed, def_strength

team_strength <- offense %>%
  left_join(defense, by = "team")

# Result has: team, avg_scored, off_strength, avg_allowed, def_strength
# One row per team, with all five columns
\`\`\`

This is SQL's \`LEFT JOIN\` — if you know SQL, the behavior is identical. The \`by = "team"\` argument tells R which column to use as the matching key. Without it, R will guess by joining on any column with the same name, which can produce surprising results.

### ggplot2: Grammar of Graphics

ggplot2 is built on a philosophy called the **grammar of graphics** — the idea that every plot can be described using a small set of composable building blocks. Rather than having separate functions for bar charts, scatter plots, and line charts, you combine layers:

\`\`\`
ggplot(data, aes(...))   # The canvas: what data, what variables map to what
  + geom_*()             # The geometry: how to draw the data
  + geom_*()             # Add more layers (lines, labels, etc.)
  + labs(...)            # Axis labels, title
  + theme_*()            # Overall visual style
  + theme(...)           # Fine-grained style overrides
\`\`\`

Each \`+\` adds a layer on top of the previous one. This makes plots highly composable — you can add, remove, or swap layers without rewriting the whole thing.

### Layer-by-Layer Breakdown

**\`ggplot(team_strength, aes(x = off_strength, y = def_strength))\`**
Sets up the coordinate system. \`aes()\` (short for "aesthetics") maps data columns to visual properties. Here we're saying: use \`off_strength\` as the x position and \`def_strength\` as the y position. This mapping is inherited by all subsequent layers unless overridden.

**\`geom_point(color = "#38bdf8", size = 3)\`**
Draws one dot per row at the (x, y) position defined by the aesthetics above. \`color\` and \`size\` are set to fixed values (not mapped to data), so every point looks the same.

**\`geom_text(aes(label = team), vjust = -0.8, size = 2.5)\`**
Adds a text label at each point's position. The \`label\` aesthetic is mapped to the \`team\` column, so each dot gets its team abbreviation. \`vjust = -0.8\` nudges the label slightly above the dot so it doesn't overlap.

**\`geom_hline(yintercept = 1)\` and \`geom_vline(xintercept = 1)\`**
Draw horizontal and vertical reference lines at 1.0 — the league average on each axis. These lines create the four quadrants. \`linetype = "dashed"\` makes them less visually dominant than the actual data points.

**\`labs(title, x, y)\`**
Sets the plot title and axis labels. Always label your axes — a chart without labels forces the reader to guess what they're looking at.

**\`theme_minimal()\`**
Applies a clean visual theme that removes the default grey background. ggplot2 ships with several built-in themes (\`theme_minimal\`, \`theme_bw\`, \`theme_classic\`, etc.) — each is a different aesthetic starting point.

**\`theme(plot.title = element_text(face = "bold"))\`**
Fine-grained overrides on top of the theme. Here we're just making the title bold. \`theme()\` can control almost every visual element in the plot.

### Reading the Final Chart

Once you run the code, look for these patterns:

- **Bottom-right** (high offense, low defense): Elite franchises — teams that have been competitive for years
- **Top-right** (high offense, high defense): Exciting but flawed — can outscore anyone, can't stop anyone
- **Bottom-left** (low offense, low defense): Grinding, defensive teams — hard to score against but equally hard to watch
- **Top-left** (low offense, high defense): Rebuilding — struggling on both sides of the ball

The dashed lines at 1.0 are your anchors. Any team above 1.0 on defense is below average defensively (allows more points than the league norm). Any team below 1.0 on defense is above average defensively. The visual asymmetry — higher x is better, lower y is better — is intentional and matches how the NFL actually works: teams want to score more than opponents.

### Your Task

1. Load ggplot2 with \`suppressPackageStartupMessages()\`
2. Calculate \`defense\` using the same \`group_by() + summarize()\` pattern as offense, but for \`points_allowed\`
3. Create \`team_strength\` by joining \`offense\` and \`defense\` on \`team\`
4. Build the scatter plot layer by layer, following the breakdown above
`,
  scaffoldCode: `# Load ggplot2
# Hint: suppressPackageStartupMessages(library(pkg))


# Calculate defensive strength (same pattern as offense but with points_allowed)
# Hint: group_by(col) %>% summarize(avg = mean(col), ratio = mean(col) / baseline, .groups = "drop")


# Merge offense and defense into one table
# Hint: combined <- left_table %>% left_join(right_table, by = "key")


# Build the scatter plot
# Hint: ggplot(data, aes(x = col1, y = col2)) + geom_point() + geom_text(aes(label = col))
# Add: geom_hline(yintercept = 1), geom_vline(xintercept = 1)
# Add: labs(title = "...", x = "...", y = "...") + theme_minimal()
`,
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
}
if (!exists("league_avg")) {
  league_avg <- mean(team_games$points_scored)
}
if (!exists("offense")) {
  offense <- team_games %>%
    group_by(team) %>%
    summarize(
      avg_scored   = mean(points_scored),
      off_strength = mean(points_scored) / league_avg,
      .groups = "drop"
    ) %>%
    arrange(desc(off_strength))
}`,
};

export default step6;
