import { LessonStep } from '../types';

const step4: LessonStep = {
  id: 'step-4',
  title: 'Forecast Functions',

  previewInstructions: `
## What Are We Building?

We have two fitted models — one for spreads (\`lm\`) and one for win probabilities (\`glm\`). But to actually *use* them, we need to wrap them in clean, reusable functions. Given just two team names, the function should look up all the necessary features, construct the input data frame, and call \`predict()\`.

The code below creates two functions:

**\`bt_spread_forecast(home, away)\`** — Returns the predicted point spread (positive = home favored). It constructs a one-row data frame with the five features our \`lm()\` model expects, then calls \`predict()\`.

**\`hybrid_prob(home, away)\`** — Returns the home team's win probability. Same feature construction, but calls \`predict()\` with \`type = "response"\` on the \`glm()\` model.

The key technique is constructing a \`newdata\` data frame for \`predict()\`. R's \`predict()\` function requires a data frame with the exact same column names as the training data. We build it from our lookup tables: \`bt_ratings\` provides the rating difference, and \`team_strength\` provides the OS/DS features.

These functions are the interface to our model. Once they exist, generating a full week of forecasts becomes a simple \`mapply()\` call.
`,

  solutionCode: `# Spread forecast function
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

# Win probability function
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

# Test with a single matchup
cat("KC at home vs BUF:\\n")
cat("  Predicted spread:", round(bt_spread_forecast("KC", "BUF"), 1), "\\n")
cat("  Home win prob:", round(hybrid_prob("KC", "BUF") * 100, 1), "%\\n")
cat("\\nBUF at home vs KC:\\n")
cat("  Predicted spread:", round(bt_spread_forecast("BUF", "KC"), 1), "\\n")
cat("  Home win prob:", round(hybrid_prob("BUF", "KC") * 100, 1), "%\\n")`,

  practiceInstructions: `
## Learning the Concepts

### Wrapping \`predict()\` in Custom Functions

R's \`predict()\` function generates predictions from a fitted model. For new data (not the training set), you must pass a \`newdata\` argument — a data frame with the exact same column names as the predictors used during fitting:

\`\`\`r
# The model was fit with: lm(h_mov ~ diff_rating + home_os + home_ds + away_os + away_ds)
# So newdata must have exactly those 5 columns

newdata <- data.frame(
  diff_rating = 0.5,
  home_os = 1.1,
  home_ds = 0.95,
  away_os = 0.98,
  away_ds = 1.02
)

predict(spread_model, newdata = newdata)
\`\`\`

If any column name is misspelled or missing, \`predict()\` will throw an error. The column names must match exactly.

### Building \`newdata\` from Lookup Tables

The function's job is to translate team names into the features the model expects. This requires two lookups:

1. **BT ratings** (named vector): \`bt_ratings["KC"] - bt_ratings["BUF"]\` gives diff_rating
2. **Team strength** (data frame): \`team_strength$off_strength[team_strength$team == "KC"]\` gives the home team's offensive strength

The \`team_strength$col[team_strength$team == "name"]\` pattern filters a data frame column using a logical condition. It returns the single value where the team column matches the name.

### \`as.numeric()\` — Stripping Names from Predictions

\`predict()\` returns a named numeric vector — even for a single prediction, the result has a name (usually "1"). Wrapping in \`as.numeric()\` strips the name, returning a clean number. This prevents ugly output like:

\`\`\`
     1
 3.452
\`\`\`

### Why Two Separate Functions?

The spread and probability models answer different questions and use different \`predict()\` calls:

| Function | Model | predict() call | Returns |
|----------|-------|---------------|---------|
| \`bt_spread_forecast()\` | \`spread_model\` (lm) | \`predict(model, newdata)\` | Point spread |
| \`hybrid_prob()\` | \`win_model\` (glm) | \`predict(model, newdata, type = "response")\` | Probability |

The glm function needs \`type = "response"\` to return probabilities instead of log-odds. The lm function doesn't need a type argument.

### Testing with Home/Away Reversal

Notice we test both KC hosting BUF and BUF hosting KC. The outputs should be roughly symmetric — if KC is favored by 3 at home, BUF should be favored by roughly 3 at their home (the exact numbers won't mirror perfectly because the OS/DS features change with venue perspective).

---

Now create both forecast functions and test them.
`,

  scaffoldCode: `# Define bt_spread_forecast(home, away)
# 1. Build a data.frame with: diff_rating, home_os, home_ds, away_os, away_ds
# 2. Call predict(spread_model, newdata = newdata)
# 3. Wrap in as.numeric() to strip names
# Hint: bt_ratings[home] - bt_ratings[away] for diff_rating
# Hint: team_strength$off_strength[team_strength$team == home] for home_os


# Define hybrid_prob(home, away)
# Same feature construction, but call predict(win_model, newdata, type = "response")


# Test with KC vs BUF (both directions)
cat("KC at home vs BUF:\\n")
cat("  Predicted spread:", round(bt_spread_forecast("KC", "BUF"), 1), "\\n")
cat("  Home win prob:", round(hybrid_prob("KC", "BUF") * 100, 1), "%\\n")
cat("\\nBUF at home vs KC:\\n")
cat("  Predicted spread:", round(bt_spread_forecast("BUF", "KC"), 1), "\\n")
cat("  Home win prob:", round(hybrid_prob("BUF", "KC") * 100, 1), "%\\n")`,

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
}`,
};

export default step4;
