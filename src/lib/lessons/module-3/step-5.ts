import { LessonStep } from '../types';

const step5: LessonStep = {
  id: 'step-5',
  title: 'Forecast a Full Week',

  previewInstructions: `
## What Are We Building?

Now we put the forecast functions to work on real games the model has **never seen**. We held out **Week 18 of the 2025 season** from training — the model was built on everything else. Now we'll predict every game from that week, generating a spread prediction, win probability, and American odds for each matchup.

This is a genuine **out-of-sample test**. The model has no knowledge of these game outcomes, so the predictions reflect what we'd actually generate before kickoff.

The workflow is:
1. Use the \`week18_games\` holdout data (already set up for you)
2. Use \`mapply()\` to call \`bt_spread_forecast()\` and \`hybrid_prob()\` for every game
3. Convert probabilities to **American odds** — the format used by sportsbooks

American odds work like this: if a team has a >50% chance of winning, the odds are negative (e.g., -150 means you bet $150 to win $100). If they have a <50% chance, the odds are positive (e.g., +200 means you bet $100 to win $200). The conversion formulas are:

\`\`\`
Favorite: -(p / (1-p)) * 100
Underdog: +((1-p) / p) * 100
\`\`\`

The final output is a printable forecast table — the kind of thing you'd see on a sports analytics blog or betting show. Each row shows the matchup, predicted spread, home win probability, and American odds for both sides.
`,

  solutionCode: `# week18_games is already loaded — these are the holdout games
# Predict spreads and win probabilities for each game
forecasts <- data.frame(
  home = week18_games$home_team,
  away = week18_games$away_team,
  spread = round(mapply(bt_spread_forecast, week18_games$home_team, week18_games$away_team), 1),
  home_prob = round(mapply(hybrid_prob, week18_games$home_team, week18_games$away_team) * 100, 1)
)

# Convert probability to American odds
prob_to_odds <- function(p) {
  p <- p / 100
  ifelse(p >= 0.5,
    paste0("-", round(p / (1 - p) * 100)),
    paste0("+", round((1 - p) / p * 100))
  )
}

forecasts$home_odds <- prob_to_odds(forecasts$home_prob)
forecasts$away_odds <- prob_to_odds(100 - forecasts$home_prob)

cat("Week 18, 2025 Forecasts\\n")
cat("=======================\\n\\n")
print(forecasts, row.names = FALSE)`,

  practiceInstructions: `
## Learning the Concepts

### \`mapply()\` — Applying a Function Across Parallel Vectors

\`mapply()\` is the multivariate version of \`sapply()\`. It takes a function and two or more vectors, calling the function once per element with matching indices:

\`\`\`r
# Call my_func(vec1[1], vec2[1]), my_func(vec1[2], vec2[2]), ...
mapply(my_func, vec1, vec2)
\`\`\`

For our forecast functions:

\`\`\`r
# Predict the spread for every game in one call
mapply(bt_spread_forecast, week18_games$home_team, week18_games$away_team)
\`\`\`

This is much cleaner than writing a for loop. \`mapply()\` returns a vector of results — one per game — which you can store directly in a data frame column.

### American Odds Conversion

American odds are the standard format in US sportsbooks. The conversion from probability is:

**Favorites (p >= 50%)**:
\`\`\`
odds = -(p / (1-p)) * 100
\`\`\`
Example: 70% probability → -(0.7/0.3) * 100 = -233

**Underdogs (p < 50%)**:
\`\`\`
odds = +((1-p) / p) * 100
\`\`\`
Example: 30% probability → +(0.7/0.3) * 100 = +233

The negative sign for favorites indicates the amount you must risk to win $100. The positive sign for underdogs indicates the amount you win on a $100 bet.

### \`ifelse()\` with \`paste0()\`

\`paste0()\` concatenates strings without any separator (unlike \`paste()\` which adds a space by default). Combined with \`ifelse()\`, it creates formatted output:

\`\`\`r
# Vectorized: applies to every element
ifelse(p >= 0.5,
  paste0("-", round(p / (1-p) * 100)),    # e.g., "-233"
  paste0("+", round((1-p) / p * 100))     # e.g., "+233"
)
\`\`\`

This produces properly formatted American odds strings like "-150" and "+200" for every game.

### \`data.frame()\` for Collecting Results

We build the forecast table by passing vectors directly to \`data.frame()\`:

\`\`\`r
forecasts <- data.frame(
  home = schedule$home_team,
  away = schedule$away_team,
  spread = mapply(forecast_fn, schedule$home_team, schedule$away_team),
  home_prob = mapply(prob_fn, schedule$home_team, schedule$away_team)
)
\`\`\`

Each argument to \`data.frame()\` becomes a column. The vectors must all be the same length. You can add computed columns afterward: \`forecasts$new_col <- transform(forecasts$existing_col)\`.

### Printing Without Row Numbers

\`print(df, row.names = FALSE)\` suppresses the default row numbers on the left side of the output. This makes the table look cleaner when the row numbers don't carry meaning.

---

Now generate the full Week 18 forecast yourself.
`,

  scaffoldCode: `# week18_games is already loaded — the holdout games our model hasn't seen
# Build a forecasts data frame with: home, away, spread, home_prob
# Hint: mapply(function_name, vector1, vector2) applies function to paired elements
# Spread: round(mapply(bt_spread_forecast, week18_games$home_team, ...), 1)
# Prob: round(mapply(hybrid_prob, week18_games$home_team, ...) * 100, 1)


# Define prob_to_odds function to convert percentage to American odds
# Hint: ifelse(p >= 50, paste0("-", round(...)), paste0("+", round(...)))
# Remember to divide p by 100 first to get a proportion


# Add home_odds and away_odds columns
# Hint: forecasts$home_odds <- prob_to_odds(forecasts$home_prob)
# Hint: forecasts$away_odds <- prob_to_odds(100 - forecasts$home_prob)


# Print the forecast table
cat("Week 18, 2025 Forecasts\\n")
cat("=======================\\n\\n")
print(forecasts, row.names = FALSE)`,

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
}
if (!exists("week18_games")) {
  standardize_team <- function(team) {
    case_when(team == "STL" ~ "LA", team == "SD" ~ "LAC", team == "OAK" ~ "LV", TRUE ~ team)
  }
  week18_games <- games %>%
    filter(game_type == "REG", season == 2025, week == 18) %>%
    select(season, week, home_team, away_team, home_score, away_score) %>%
    mutate(home_team = standardize_team(home_team), away_team = standardize_team(away_team))
}`,
};

export default step5;
