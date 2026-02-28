import { LessonStep } from '../types';

const step3: LessonStep = {
  id: 'step-3',
  title: 'Win Probability with glm()',

  previewInstructions: `
## What Are We Building?

The spread model predicts *how much* a team wins by. But sometimes you want a probability: "what's the chance the home team wins?" That's what **logistic regression** (\`glm()\` with \`family = binomial()\`) provides.

Logistic regression is the supervised-learning equivalent of what Bradley-Terry does from scratch. It takes the same features (diff_rating + OS/DS) but predicts the *probability* of a binary outcome (win/loss) rather than a continuous margin. Under the hood, it fits a logistic function (the same S-curve from Module 2 Step 2) to the data — but now it can use multiple features simultaneously.

The key difference from \`lm()\` is the \`family = binomial()\` argument, which tells R this is a classification problem with a binary outcome. The model outputs log-odds internally, but \`predict(model, type = "response")\` converts those to probabilities.

We compare both models side by side. The spread model gives you a point estimate; the win probability model gives you a calibrated probability. Together, they answer the two questions every bettor and analyst cares about: "who wins?" and "by how much?"
`,

  solutionCode: `# Fit a logistic regression for win probability
win_model <- glm(
  h_win ~ diff_rating + home_os + home_ds + away_os + away_ds,
  data = model_data,
  family = binomial()
)

summary(win_model)

# Compare predictions from both models
model_data$lm_pred <- predict(spread_model)
model_data$glm_pred <- predict(win_model, type = "response")

cat("\\nSpread model R-squared:", round(summary(spread_model)$r.squared, 4))
cat("\\nWin model AIC:", round(AIC(win_model), 1))
cat("\\n\\nSample predictions (first 5 games):\\n")
print(model_data %>% select(home_team, away_team, h_mov, lm_pred, h_win, glm_pred) %>% head(5))`,

  practiceInstructions: `
## Learning the Concepts

### \`glm()\` — Generalized Linear Models

\`glm()\` extends \`lm()\` to handle non-normal response variables. For binary outcomes (win/loss), you use the binomial family:

\`\`\`r
model <- glm(y ~ x1 + x2, data = df, family = binomial())
\`\`\`

The \`family = binomial()\` argument tells R to:
1. Use the logistic link function (mapping linear predictions to 0-1 probabilities)
2. Use maximum likelihood estimation (not least squares)
3. Report deviance instead of R-squared

The formula syntax is identical to \`lm()\` — only the \`family\` argument changes.

### \`predict()\` with \`type = "response"\`

By default, \`predict(glm_model)\` returns *log-odds* (the raw linear predictor). To get *probabilities*, you must specify \`type = "response"\`:

\`\`\`r
# Log-odds (not directly useful)
predict(win_model)                      # e.g., 0.85, -0.32, 1.47

# Probabilities (what you want)
predict(win_model, type = "response")   # e.g., 0.70, 0.42, 0.81
\`\`\`

This is one of the most common gotchas in R — forgetting \`type = "response"\` and getting log-odds instead of probabilities.

For \`lm()\` models, \`predict()\` always returns the predicted value directly (no type argument needed).

### AIC — Model Comparison Metric

AIC (Akaike Information Criterion) balances model fit against complexity:

\`\`\`r
AIC(win_model)   # lower is better
\`\`\`

AIC penalizes models for having more parameters. Between two models with similar fit, the one with fewer parameters (lower AIC) is preferred. AIC is most useful for comparing models on the *same data* and *same response variable* — you can't compare AIC between an lm() and a glm() since they use different likelihoods.

### lm() vs glm() — When to Use Which

| Question | Model | Output |
|----------|-------|--------|
| "By how many points?" | \`lm(h_mov ~ ...)\` | Continuous margin prediction |
| "Will they win?" | \`glm(h_win ~ ..., family = binomial())\` | Win probability (0 to 1) |

Both use the same features. The spread model is better for setting point spreads. The win model is better for moneyline odds and calibrated probabilities.

### Storing Predictions Back in the Data

\`predict(model)\` returns a vector the same length as the training data. You can store it as a new column:

\`\`\`r
model_data$lm_pred  <- predict(spread_model)                    # predicted margin
model_data$glm_pred <- predict(win_model, type = "response")    # predicted win prob
\`\`\`

This is useful for comparing predictions to actuals, computing residuals, and building diagnostic plots.

---

Now fit the win probability model and compare both models.
`,

  scaffoldCode: `# Fit logistic regression: h_win ~ diff_rating + home_os + home_ds + away_os + away_ds
# Hint: model <- glm(y ~ x1 + x2, data = df, family = binomial())


# Print the model summary
# Hint: summary(model)


# Store predictions from both models in model_data
# Hint: model_data$lm_pred <- predict(spread_model)
# Hint: model_data$glm_pred <- predict(win_model, type = "response")


# Compare models
cat("\\nSpread model R-squared:", round(summary(spread_model)$r.squared, 4))
cat("\\nWin model AIC:", round(AIC(win_model), 1))

# Print first 5 rows with predictions
cat("\\n\\nSample predictions (first 5 games):\\n")
print(model_data %>% select(home_team, away_team, h_mov, lm_pred, h_win, glm_pred) %>% head(5))`,

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
    filter(game_type == "REG", season >= 2015, !(season == 2025 & week == 18)) %>%
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
}`,
};

export default step3;
