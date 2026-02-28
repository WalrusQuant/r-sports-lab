import { LessonStep } from '../types';

const step2: LessonStep = {
  id: 'step-2',
  title: 'Bradley-Terry Intuition',

  previewInstructions: `
## What Are We Building?

Before we write a single line of model-fitting code, we need to understand the core idea behind Bradley-Terry: the **logistic function**. This is the mathematical bridge that converts a rating difference between two teams into a win probability.

The intuition is simple: if two teams have identical ratings, neither has an advantage — the win probability is 50%. As the home team's rating climbs above the away team's, the probability rises toward 100%. As it drops below, the probability falls toward 0%. The logistic function maps any rating difference (from negative infinity to positive infinity) onto the (0, 1) probability scale.

The formula is:

\`\`\`
P(home wins) = 1 / (1 + exp(-(r_home - r_away)))
\`\`\`

This produces the classic **S-curve** (sigmoid). The S-shape captures something important about competition: the first few points of advantage matter a lot (going from even to slightly favored moves you from 50% to 60%), but additional advantages have diminishing returns (going from heavily favored to extremely favored barely moves the needle from 95% to 96%).

The code below defines \`bt_prob()\` as a reusable function, generates a sequence of rating differences from -5 to +5, and plots the resulting S-curve. The dashed crosshairs at (0, 0.5) mark the equilibrium point — equal ratings, coin-flip game.
`,

  solutionCode: `suppressPackageStartupMessages(library(ggplot2))

# The logistic function: rating difference -> win probability
bt_prob <- function(rating_diff) {
  1 / (1 + exp(-rating_diff))
}

# Test a few values
cat("Equal ratings (diff = 0):", bt_prob(0), "\\n")
cat("Home +1 advantage:", round(bt_prob(1), 3), "\\n")
cat("Home -1 disadvantage:", round(bt_prob(-1), 3), "\\n\\n")

# Generate S-curve data
diff_seq <- seq(-5, 5, by = 0.1)
plot_data <- data.frame(diff = diff_seq, prob = bt_prob(diff_seq))

# Plot the S-curve
ggplot(plot_data, aes(x = diff, y = prob)) +
  geom_line(color = "#38bdf8", linewidth = 1.2) +
  geom_hline(yintercept = 0.5, linetype = "dashed", color = "gray50") +
  geom_vline(xintercept = 0, linetype = "dashed", color = "gray50") +
  labs(
    title = "Bradley-Terry: Rating Difference to Win Probability",
    x = "Rating Difference (Home - Away)",
    y = "P(Home Wins)"
  ) +
  theme_minimal() +
  theme(plot.title = element_text(face = "bold"))`,

  practiceInstructions: `
## Learning the Concepts

### Writing Custom Functions in R

R lets you define your own functions with the \`function()\` keyword:

\`\`\`r
my_func <- function(arg1, arg2) {
  # body — the last expression is returned
  arg1 + arg2
}
\`\`\`

For one-line functions, the braces are still needed for clarity:

\`\`\`r
bt_prob <- function(rating_diff) {
  1 / (1 + exp(-rating_diff))
}
\`\`\`

This creates a function that takes a single argument and returns the logistic transformation. Because R vectorizes math operations automatically, this function works on both single numbers and entire vectors — \`bt_prob(0)\` returns a single probability, and \`bt_prob(c(-1, 0, 1))\` returns three probabilities.

### The Logistic Function

The formula \`1 / (1 + exp(-x))\` is one of the most important functions in statistics and machine learning. Here's why it's the right choice for Bradley-Terry:

- **Domain**: Takes any real number as input (ratings can be any value)
- **Range**: Outputs are always between 0 and 1 (valid probabilities)
- **Symmetry**: \`bt_prob(x) = 1 - bt_prob(-x)\` — if home has a 73% chance, away has 27%
- **Monotonic**: Higher rating difference always means higher probability

The \`exp()\` function in R computes *e* raised to a power. When the rating difference is 0, \`exp(0) = 1\`, so the formula becomes \`1 / (1 + 1) = 0.5\` — a coin flip, as expected.

### \`seq()\` — Generating Regular Sequences

\`seq(from, to, by)\` creates a numeric vector from \`from\` to \`to\`, stepping by \`by\`:

\`\`\`r
seq(-5, 5, by = 0.1)   # -5.0, -4.9, -4.8, ..., 4.9, 5.0
seq(0, 1, by = 0.25)   # 0.00, 0.25, 0.50, 0.75, 1.00
\`\`\`

This is essential for plotting smooth curves — you generate many closely-spaced x values, compute y for each, and connect the dots with \`geom_line()\`.

### \`geom_line()\` — Drawing Lines in ggplot2

While \`geom_point()\` draws one dot per row, \`geom_line()\` connects consecutive points with a line. It's ideal for showing how one variable changes continuously as another increases:

\`\`\`r
ggplot(data, aes(x = x_col, y = y_col)) +
  geom_line(color = "#38bdf8", linewidth = 1.2)
\`\`\`

The \`linewidth\` argument controls thickness (default is about 0.5). Setting it to 1.2 makes the curve more prominent.

### Combining Layers: Reference Lines

Adding \`geom_hline()\` and \`geom_vline()\` creates visual reference points. The crosshairs at (0, 0.5) mark the equilibrium — where the rating difference is zero and the game is a coin flip. Everything to the right favors the home team; everything to the left favors the away team.

---

Now define the function, test it with a few values, and plot the S-curve yourself.
`,

  scaffoldCode: `# Load ggplot2
# Hint: suppressPackageStartupMessages(library(ggplot2))


# Define bt_prob: takes a rating difference, returns win probability
# Formula: 1 / (1 + exp(-rating_diff))
# Hint: func_name <- function(arg) { formula }


# Test with a few values
cat("Equal ratings (diff = 0):", bt_prob(0), "\\n")
cat("Home +1 advantage:", round(bt_prob(1), 3), "\\n")
cat("Home -1 disadvantage:", round(bt_prob(-1), 3), "\\n\\n")

# Generate a sequence of rating differences from -5 to 5
# Hint: diff_seq <- seq(from, to, by = step)


# Create a data frame for plotting
# Hint: plot_data <- data.frame(diff = diff_seq, prob = bt_prob(diff_seq))


# Plot the S-curve with reference lines at 0 and 0.5
# Hint: ggplot(data, aes(x, y)) + geom_line() + geom_hline() + geom_vline() + labs() + theme_minimal()
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
}
if (!exists("model_data")) {
  model_data <- games_clean %>%
    mutate(h_mov = home_score - away_score, h_win = as.integer(h_mov > 0)) %>%
    left_join(team_strength %>% select(team, home_os = off_strength, home_ds = def_strength), by = c("home_team" = "team")) %>%
    left_join(team_strength %>% select(team, away_os = off_strength, away_ds = def_strength), by = c("away_team" = "team"))
}`,
};

export default step2;
