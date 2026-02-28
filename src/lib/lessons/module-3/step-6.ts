import { LessonStep } from '../types';

const step6: LessonStep = {
  id: 'step-6',
  title: 'Model Evaluation',

  previewInstructions: `
## What Are We Building?

This is the payoff step. We take our Week 1 2025 predictions and compare them against what actually happened on the field. Did the model pick the right winners? How close were the predicted spreads to the actual margins?

We compute two evaluation metrics:

**Pick accuracy** — the percentage of games where the model correctly predicted the winner (home_prob > 50% and the home team actually won, or home_prob < 50% and the away team won).

**Spread MAE** (Mean Absolute Error) — how many points off the predicted spread was from the actual margin, on average. An MAE of 10 means we were off by about 10 points per game. NFL margins have a standard deviation of ~14 points, so even an MAE of 10-12 is reasonable for a simple model.

The final visualization is a **grouped bar chart** comparing predicted spreads to actual margins for every game. Blue bars show what the model predicted; red bars show what actually happened. Side-by-side bars reveal the model's strengths (games where it was close) and weaknesses (games where it missed badly).

This is a common format in sports analytics reporting — it gives readers an instant visual sense of model performance across an entire slate of games.
`,

  solutionCode: `suppressPackageStartupMessages(library(ggplot2))

# Get actual results for Week 1, 2025
week1_actual <- games_clean %>%
  filter(season == 2025, week == 1) %>%
  mutate(
    actual_mov = home_score - away_score,
    actual_win = as.integer(actual_mov > 0)
  )

# Build evaluation table
eval_data <- data.frame(
  matchup = paste(week1_actual$away_team, "@", week1_actual$home_team),
  pred_spread = round(mapply(bt_spread_forecast, week1_actual$home_team, week1_actual$away_team), 1),
  actual_spread = week1_actual$actual_mov,
  pred_win = as.numeric(mapply(hybrid_prob, week1_actual$home_team, week1_actual$away_team)),
  actual_win = week1_actual$actual_win
)

# Accuracy and MAE
eval_data$correct <- as.integer((eval_data$pred_win > 0.5) == (eval_data$actual_win == 1))
accuracy <- mean(eval_data$correct)
mae <- mean(abs(eval_data$pred_spread - eval_data$actual_spread))

cat("Week 1 2025 Results:\\n")
cat("Pick accuracy:", round(accuracy * 100, 1), "%\\n")
cat("Spread MAE:", round(mae, 1), "points\\n\\n")

# Grouped bar chart: predicted vs actual spread
plot_data <- data.frame(
  matchup = rep(eval_data$matchup, 2),
  type = rep(c("Predicted", "Actual"), each = nrow(eval_data)),
  spread = c(eval_data$pred_spread, eval_data$actual_spread)
)

ggplot(plot_data, aes(x = matchup, y = spread, fill = type)) +
  geom_col(position = "dodge") +
  coord_flip() +
  scale_fill_manual(values = c("Predicted" = "#38bdf8", "Actual" = "#f87171")) +
  labs(
    title = "Week 1 2025: Predicted vs Actual Spread",
    x = NULL,
    y = "Home Margin of Victory",
    fill = NULL
  ) +
  theme_minimal() +
  theme(
    plot.title = element_text(face = "bold"),
    legend.position = "top"
  )`,

  practiceInstructions: `
## Learning the Concepts

### Comparing Predictions to Actuals

The evaluation workflow follows a standard pattern:
1. Generate predictions for a known set of games
2. Retrieve the actual outcomes
3. Compute error metrics
4. Visualize the comparison

The key is that the actual outcomes come from \`games_clean\`, which has the real scores. We already used these games for training (since our model was fit on all 2015-2025 data), so this isn't a true out-of-sample test — but it demonstrates the evaluation workflow you'd use with genuinely held-out data.

### Accuracy from Probabilities

Converting probabilities to binary picks and checking accuracy:

\`\`\`r
# Model favors home if probability > 50%
# Check if the actual winner matches the predicted favorite
eval_data$correct <- as.integer(
  (eval_data$pred_win > 0.5) == (eval_data$actual_win == 1)
)
accuracy <- mean(eval_data$correct)
\`\`\`

The inner comparison \`(pred_win > 0.5) == (actual_win == 1)\` is TRUE when both sides agree (both TRUE or both FALSE), and FALSE when they disagree.

### MAE — Mean Absolute Error

MAE is the average absolute difference between predicted and actual values:

\`\`\`r
mae <- mean(abs(predicted - actual))
\`\`\`

For NFL spreads, typical MAE values:
- **10-12 points**: Reasonable for a simple model
- **8-10 points**: Good — competitive with basic betting models
- **< 8 points**: Excellent — approaching the limit of predictability

### Reshaping for Grouped Bar Charts

ggplot2 needs long-format data for grouped bars. We reshape by stacking the predicted and actual spreads:

\`\`\`r
plot_data <- data.frame(
  matchup = rep(eval_data$matchup, 2),
  type    = rep(c("Predicted", "Actual"), each = nrow(eval_data)),
  spread  = c(eval_data$pred_spread, eval_data$actual_spread)
)
\`\`\`

- \`rep(matchup, 2)\` repeats each matchup name twice (once for predicted, once for actual)
- \`rep(c("Predicted", "Actual"), each = n)\` creates the group labels
- \`c(pred_spread, actual_spread)\` stacks both value vectors

### \`geom_col(position = "dodge")\`

\`position = "dodge"\` places bars side by side instead of stacking them:

\`\`\`r
ggplot(data, aes(x = matchup, y = spread, fill = type)) +
  geom_col(position = "dodge")
\`\`\`

Without \`"dodge"\`, ggplot would stack the bars on top of each other. With \`coord_flip()\`, the matchup names go on the y-axis (making them readable) and the spread values extend horizontally.

### \`scale_fill_manual()\`

Assigns specific colors to each group:

\`\`\`r
scale_fill_manual(values = c("Predicted" = "#38bdf8", "Actual" = "#f87171"))
\`\`\`

The names must exactly match the values in the \`type\` column.

---

Now evaluate the model and build the comparison chart yourself.
`,

  scaffoldCode: `# Load ggplot2
# Hint: suppressPackageStartupMessages(library(ggplot2))


# Get actual Week 1, 2025 results from games_clean
# Add actual_mov (home_score - away_score) and actual_win columns
# Hint: data %>% filter(...) %>% mutate(actual_mov = ..., actual_win = as.integer(... > 0))


# Build evaluation table with: matchup, pred_spread, actual_spread, pred_win, actual_win
# Hint: mapply(bt_spread_forecast, home_teams, away_teams) for predictions
# Hint: paste(away, "@", home) for matchup labels


# Calculate accuracy and MAE
# Hint: mean(correct), mean(abs(pred - actual))


# Print results
cat("Week 1 2025 Results:\\n")
cat("Pick accuracy:", round(accuracy * 100, 1), "%\\n")
cat("Spread MAE:", round(mae, 1), "points\\n\\n")

# Build grouped bar chart: predicted vs actual spread
# 1. Reshape to long format with data.frame() + rep() + c()
# 2. ggplot(data, aes(x = matchup, y = spread, fill = type)) + geom_col(position = "dodge")
# 3. Add coord_flip() + scale_fill_manual() + labs() + theme_minimal()
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
if (!"diff_rating" %in% names(model_data)) {
  model_data$diff_rating <- bt_ratings[model_data$home_team] - bt_ratings[model_data$away_team]
}
if (!exists("spread_model")) {
  spread_model <- lm(h_mov ~ diff_rating + home_os + home_ds + away_os + away_ds, data = model_data)
}
if (!exists("win_model")) {
  win_model <- glm(h_win ~ diff_rating + home_os + home_ds + away_os + away_ds, data = model_data, family = binomial())
}
if (!exists("bt_spread_forecast")) {
  bt_spread_forecast <- function(home, away) {
    newdata <- data.frame(
      diff_rating = bt_ratings[home] - bt_ratings[away],
      home_os = team_strength$off_strength[team_strength$team == home],
      home_ds = team_strength$def_strength[team_strength$team == home],
      away_os = team_strength$off_strength[team_strength$team == away],
      away_ds = team_strength$def_strength[team_strength$team == away]
    )
    as.numeric(predict(spread_model, newdata = newdata))
  }
}
if (!exists("hybrid_prob")) {
  hybrid_prob <- function(home, away) {
    newdata <- data.frame(
      diff_rating = bt_ratings[home] - bt_ratings[away],
      home_os = team_strength$off_strength[team_strength$team == home],
      home_ds = team_strength$def_strength[team_strength$team == home],
      away_os = team_strength$off_strength[team_strength$team == away],
      away_ds = team_strength$def_strength[team_strength$team == away]
    )
    as.numeric(predict(win_model, newdata = newdata, type = "response"))
  }
}`,
};

export default step6;
