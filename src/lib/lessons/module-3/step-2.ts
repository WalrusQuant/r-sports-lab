import { LessonStep } from '../types';

const step2: LessonStep = {
  id: 'step-2',
  title: 'Spread Model with lm()',

  previewInstructions: `
## What Are We Building?

Now we fit the first of two regression models: a **linear model** that predicts the home team's margin of victory (\`h_mov\`) from the BT rating difference plus the four OS/DS features.

\`lm()\` (linear model) is R's workhorse for regression. It finds the coefficients that minimize the sum of squared errors — the best-fit line through the data. The formula syntax \`h_mov ~ diff_rating + home_os + home_ds + away_os + away_ds\` reads as: "predict h_mov as a linear combination of these five features."

The output tells us several things:
- **Coefficients**: How much each feature contributes to the predicted spread. A coefficient of 8.5 on diff_rating means each unit of rating difference is worth 8.5 points of margin.
- **R-squared**: The fraction of variance in h_mov explained by the model. An R² of 0.10 means 10% of the game-to-game variance in margins is explained. That sounds low, but NFL games are extremely noisy — even the best models explain only 10-15% of margin variance.
- **p-values**: Which features are statistically significant predictors. Features with very small p-values (< 0.05) are reliably contributing to predictions.

This model is what you'd use to generate a **point spread** — the number of points the home team is favored by. Vegas spreads are fundamentally regression predictions of this type.
`,

  solutionCode: `# Fit a linear model predicting home margin of victory
spread_model <- lm(
  h_mov ~ diff_rating + home_os + home_ds + away_os + away_ds,
  data = model_data
)

summary(spread_model)

cat("\\nR-squared:", round(summary(spread_model)$r.squared, 4))
cat("\\nCoefficients:\\n")
print(round(coef(spread_model), 3))`,

  practiceInstructions: `
## Learning the Concepts

### \`lm()\` — Linear Regression in R

\`lm()\` fits an ordinary least squares (OLS) linear regression. The syntax uses R's formula notation:

\`\`\`r
model <- lm(y ~ x1 + x2 + x3, data = my_data)
\`\`\`

The \`~\` (tilde) separates the response variable (left) from the predictors (right). The \`+\` doesn't mean addition — it means "include this predictor." The model R fits is:

\`\`\`
y = b0 + b1*x1 + b2*x2 + b3*x3 + error
\`\`\`

Where \`b0\` is the intercept and \`b1, b2, b3\` are the coefficients \`lm()\` estimates.

### \`summary()\` — The Model Report

\`summary(model)\` prints a comprehensive report:

\`\`\`
Coefficients:
            Estimate Std. Error t value Pr(>|t|)
(Intercept)  -1.234      2.456  -0.502  0.6156
diff_rating   8.500      0.312  27.244  < 2e-16 ***
home_os       5.678      1.234   4.602  4.3e-06 ***
...
\`\`\`

- **Estimate**: The coefficient value. For diff_rating, this is how many points of margin each unit of rating difference is worth.
- **Std. Error**: How uncertain the coefficient is. Smaller is better.
- **t value**: Estimate / Std. Error. Larger absolute values mean stronger evidence.
- **Pr(>|t|)**: The p-value. Values below 0.05 are conventionally "significant." Stars indicate significance levels.

### \`coef()\` — Extracting Coefficients

\`coef(model)\` returns a named vector of all coefficients:

\`\`\`r
coef(spread_model)
# (Intercept) diff_rating     home_os     home_ds     away_os     away_ds
#     -1.234       8.500       5.678      -3.456      -4.321       2.987
\`\`\`

This is useful when you need to programmatically access individual coefficients: \`coef(spread_model)["diff_rating"]\`.

### R-squared — What It Means

R² (coefficient of determination) ranges from 0 to 1. It tells you what fraction of the total variance in the outcome is explained by your predictors.

\`\`\`r
summary(spread_model)$r.squared
\`\`\`

| R² | Interpretation |
|----|---------------|
| 0.00 | Model explains nothing — predicting the mean would be just as good |
| 0.05-0.15 | Typical for single-game NFL prediction models |
| 0.50+ | Would be remarkable for sports — games have enormous inherent randomness |

Don't be disappointed by a low R². NFL margins of victory have a standard deviation of about 14 points. Even explaining 10% of that variance gives you a meaningful edge over naive predictions.

### Interpreting the Coefficients

Each coefficient tells you: "holding all other features constant, a one-unit increase in this predictor is associated with this many additional points of home margin."

For example, if the coefficient on \`diff_rating\` is 8.5:
- A team that is 1.0 BT units stronger than their opponent is predicted to win by about 8.5 more points
- A team that is 0.5 BT units stronger is predicted to win by about 4.25 more points

Negative coefficients on defensive features make intuitive sense — a higher defensive strength means the opponent allows *more* points, which should *reduce* the home team's margin.

---

Now fit the spread model yourself and interpret the output.
`,

  scaffoldCode: `# Fit a linear model: h_mov ~ diff_rating + home_os + home_ds + away_os + away_ds
# Hint: model <- lm(y ~ x1 + x2 + x3, data = data_frame)


# Print the full model summary
# Hint: summary(model)


# Print the R-squared value
# Hint: summary(model)$r.squared


# Print just the coefficients
# Hint: round(coef(model), 3)
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
}`,
};

export default step2;
