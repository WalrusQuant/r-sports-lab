import { LessonStep } from '../types';

const step6: LessonStep = {
  id: 'step-6',
  title: 'Visualize Ratings',

  previewInstructions: `
## What Are We Building?

Numbers in a table are useful. Charts make them undeniable. This step produces two visualizations that bring the Bradley-Terry model to life.

**Chart 1 — Rating Bar Chart**: A horizontal bar chart showing all 32 teams ranked by their BT rating. Teams above zero are above-average; teams below zero are below-average. The color split (blue for positive, red for negative) makes the league's hierarchy immediately visible. The \`reorder()\` function sorts the bars by rating value rather than alphabetical order.

**Chart 2 — Calibration Plot**: The gold standard for evaluating probabilistic predictions. We take the test set predictions from Step 5, bin them into probability ranges (0–10%, 10–20%, ..., 90–100%), and for each bin, check: did the home team *actually* win at the rate we predicted? A perfectly calibrated model produces points along the diagonal. Points above the diagonal mean the model is under-confident; points below mean it's over-confident.

The calibration plot uses \`cut()\` to bin continuous probabilities into discrete ranges — a base R function that's essential whenever you need to convert a continuous variable into categories.
`,

  solutionCode: `suppressPackageStartupMessages(library(ggplot2))

# --- Chart 1: BT Ratings Bar Chart ---

ratings_df <- data.frame(
  team = names(bt_ratings),
  rating = as.numeric(bt_ratings)
)

ggplot(ratings_df, aes(x = reorder(team, rating), y = rating, fill = rating > 0)) +
  geom_col() +
  scale_fill_manual(values = c("FALSE" = "#f87171", "TRUE" = "#38bdf8"), guide = "none") +
  coord_flip() +
  labs(
    title = "Bradley-Terry Ratings (2015-present)",
    x = NULL,
    y = "Rating (mean-centered)"
  ) +
  theme_minimal() +
  theme(plot.title = element_text(face = "bold"))

# --- Chart 2: Calibration Plot ---

cal_data <- data.frame(
  predicted = as.numeric(test_prob),
  actual = test$h_win
)
cal_data$bin <- cut(cal_data$predicted, breaks = seq(0, 1, by = 0.1), include.lowest = TRUE)

cal_summary <- cal_data %>%
  group_by(bin) %>%
  summarize(
    avg_predicted = mean(predicted),
    avg_actual = mean(actual),
    n = n(),
    .groups = "drop"
  ) %>%
  filter(n >= 5)

ggplot(cal_summary, aes(x = avg_predicted, y = avg_actual)) +
  geom_abline(slope = 1, intercept = 0, linetype = "dashed", color = "gray50") +
  geom_point(aes(size = n), color = "#38bdf8") +
  geom_line(color = "#38bdf8", linewidth = 0.8) +
  scale_size_continuous(range = c(2, 8)) +
  coord_cartesian(xlim = c(0, 1), ylim = c(0, 1)) +
  labs(
    title = "Calibration: Predicted vs Actual Win Rate",
    x = "Predicted Probability",
    y = "Actual Win Rate",
    size = "Games"
  ) +
  theme_minimal() +
  theme(plot.title = element_text(face = "bold"))`,

  practiceInstructions: `
## Learning the Concepts

### \`reorder()\` — Sorting Factor Levels by Another Variable

By default, ggplot2 orders categorical variables alphabetically. That puts ARI first and WAS last, which tells you nothing. \`reorder(factor, value)\` reorders the factor levels by the corresponding values:

\`\`\`r
# Alphabetical (default) — not useful
aes(x = team, y = rating)

# Ordered by rating — highest at top
aes(x = reorder(team, rating), y = rating)
\`\`\`

With \`coord_flip()\` (which swaps x and y axes to make horizontal bars), the highest-rated team appears at the top of the chart and the lowest at the bottom. This is the standard way to make readable bar charts with many categories.

### \`geom_col()\` with Conditional Fill

You can map the fill color to a logical expression inside \`aes()\`:

\`\`\`r
aes(fill = rating > 0)
\`\`\`

This creates two groups: \`TRUE\` (positive ratings) and \`FALSE\` (negative ratings). Then \`scale_fill_manual()\` assigns colors to each group:

\`\`\`r
scale_fill_manual(values = c("FALSE" = "#f87171", "TRUE" = "#38bdf8"), guide = "none")
\`\`\`

The \`guide = "none"\` argument hides the legend — the color meaning is obvious from context.

### \`cut()\` — Binning Continuous Data

\`cut()\` converts a continuous numeric vector into a factor with discrete levels (bins):

\`\`\`r
# Create 10 bins from 0 to 1
bins <- cut(probabilities, breaks = seq(0, 1, by = 0.1), include.lowest = TRUE)
\`\`\`

- \`breaks\` defines the bin edges: 0, 0.1, 0.2, ..., 1.0
- \`include.lowest = TRUE\` makes the first bin \`[0, 0.1]\` instead of \`(0, 0.1]\` — without this, exactly 0.0 would be excluded

The result is a factor where each element is labeled with its bin range (e.g., \`"(0.3,0.4]"\`). This is essential for the calibration plot: we group by bin, then compute the actual win rate within each bin.

### Calibration: What It Means

A **calibration plot** answers: "When the model says 70%, does the event actually happen 70% of the time?"

To build one:
1. Bin all predictions into probability ranges
2. For each bin, compute the average predicted probability (x) and the actual win rate (y)
3. Plot predicted vs actual
4. A well-calibrated model tracks the diagonal

Common patterns:
- **Points above diagonal**: model is under-confident (says 60%, actually wins 75%)
- **Points below diagonal**: model is over-confident (says 80%, actually wins 60%)
- **Points on diagonal**: perfectly calibrated

### \`coord_cartesian()\` vs \`xlim()/ylim()\`

\`coord_cartesian(xlim, ylim)\` zooms the view without removing data points. This is safer than \`xlim()\`/\`ylim()\` inside scales, which silently drop points outside the range and can change the regression line.

---

Now build both charts yourself.
`,

  scaffoldCode: `# Load ggplot2
# Hint: suppressPackageStartupMessages(library(ggplot2))


# --- Chart 1: BT Ratings Bar Chart ---

# Create a data frame from bt_ratings
# Hint: data.frame(team = names(vector), rating = as.numeric(vector))


# Plot horizontal bars ordered by rating, colored by positive/negative
# Hint: ggplot(data, aes(x = reorder(team, rating), y = rating, fill = rating > 0)) + geom_col()
# Add: scale_fill_manual(values = c("FALSE" = "#f87171", "TRUE" = "#38bdf8"), guide = "none")
# Add: coord_flip() + labs(...) + theme_minimal()


# --- Chart 2: Calibration Plot ---

# Create calibration data from test predictions
# Hint: data.frame(predicted = as.numeric(test_prob), actual = test$h_win)


# Bin predictions using cut()
# Hint: cal_data$bin <- cut(cal_data$predicted, breaks = seq(0, 1, by = 0.1), include.lowest = TRUE)


# Summarize: average predicted and actual per bin
# Hint: group_by(bin) %>% summarize(avg_predicted = mean(predicted), avg_actual = mean(actual), n = n())
# Filter to bins with at least 5 games


# Plot calibration: points + line + diagonal reference
# Hint: ggplot(data, aes(x = avg_predicted, y = avg_actual)) + geom_abline(...) + geom_point(aes(size = n))
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
}
if (!exists("bt_prob")) {
  bt_prob <- function(rating_diff) { 1 / (1 + exp(-rating_diff)) }
}
if (!exists("bt_log_likelihood")) {
  bt_log_likelihood <- function(ratings, teams_home, teams_away, outcomes) {
    diff <- ratings[teams_home] - ratings[teams_away]
    prob <- 1 / (1 + exp(-diff))
    prob <- pmax(pmin(prob, 1 - 1e-10), 1e-10)
    sum(outcomes * log(prob) + (1 - outcomes) * log(1 - prob))
  }
}
if (!exists("all_teams")) {
  all_teams <- sort(unique(c(model_data$home_team, model_data$away_team)))
}
if (!exists("bt_ratings")) {
  bt_optim_fn <- function(par) {
    names(par) <- all_teams
    bt_log_likelihood(par, model_data$home_team, model_data$away_team, model_data$h_win)
  }
  fit <- optim(par = rep(0, length(all_teams)), fn = bt_optim_fn, method = "BFGS", control = list(fnscale = -1))
  bt_ratings <- setNames(fit$par, all_teams)
  bt_ratings <- bt_ratings - mean(bt_ratings)
}
if (!exists("test")) {
  set.seed(42)
  n <- nrow(model_data)
  train_idx <- sample(1:n, size = floor(0.8 * n))
  train <- model_data[train_idx, ]
  test <- model_data[-train_idx, ]
}
if (!exists("test_prob")) {
  bt_train_fn <- function(par) {
    names(par) <- all_teams
    bt_log_likelihood(par, train$home_team, train$away_team, train$h_win)
  }
  fit_train <- optim(par = rep(0, length(all_teams)), fn = bt_train_fn, method = "BFGS", control = list(fnscale = -1))
  bt_train_ratings <- setNames(fit_train$par, all_teams)
  bt_train_ratings <- bt_train_ratings - mean(bt_train_ratings)
  test_diff <- bt_train_ratings[test$home_team] - bt_train_ratings[test$away_team]
  test_prob <- 1 / (1 + exp(-test_diff))
}`,
};

export default step6;
