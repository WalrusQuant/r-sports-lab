import { LessonStep } from '../types';

const step5: LessonStep = {
  id: 'step-5',
  title: 'Train/Test Split',

  previewInstructions: `
## What Are We Building?

We have Bradley-Terry ratings that fit the data well — but how well do they *generalize*? A model that memorizes the training data but can't predict new games is useless. The standard way to check is a **train/test split**: randomly divide the data into 80% training and 20% testing, refit the model on just the training data, then measure how well those ratings predict the held-out test games.

This is the same methodology used across all of machine learning. The training set is what the model learns from. The test set is what we evaluate on. The model never sees the test data during fitting, so test performance is an honest measure of generalization.

We evaluate with two metrics:

**Log loss** — the average negative log-likelihood per game on the test set. Lower is better. It penalizes confident wrong predictions harshly: predicting 95% for a game that the underdog wins costs much more than predicting 55%.

**Accuracy** — the percentage of test games where the model correctly predicted the winner (probability > 50% for the team that actually won). This is simpler to interpret but less informative — a model that predicts 51% for every game could have high accuracy but terrible log loss.

The code below runs the full pipeline: split, refit, predict, evaluate.
`,

  solutionCode: `# 80/20 train/test split
set.seed(42)
n <- nrow(model_data)
train_idx <- sample(1:n, size = floor(0.8 * n))
train <- model_data[train_idx, ]
test <- model_data[-train_idx, ]

# Refit BT on training data only
bt_train_fn <- function(par) {
  names(par) <- all_teams
  bt_log_likelihood(par, train$home_team, train$away_team, train$h_win)
}

fit_train <- optim(
  par = rep(0, length(all_teams)),
  fn = bt_train_fn,
  method = "BFGS",
  control = list(fnscale = -1)
)

bt_train_ratings <- setNames(fit_train$par, all_teams)
bt_train_ratings <- bt_train_ratings - mean(bt_train_ratings)

# Predict on test set
test_diff <- bt_train_ratings[test$home_team] - bt_train_ratings[test$away_team]
test_prob <- 1 / (1 + exp(-test_diff))

# Log loss
test_prob_clamped <- pmax(pmin(test_prob, 1 - 1e-10), 1e-10)
log_loss <- -mean(test$h_win * log(test_prob_clamped) + (1 - test$h_win) * log(1 - test_prob_clamped))

# Accuracy
predicted_win <- as.integer(test_prob > 0.5)
accuracy <- mean(predicted_win == test$h_win)

cat("Train games:", nrow(train), "| Test games:", nrow(test), "\\n")
cat("Test log loss:", round(log_loss, 4), "\\n")
cat("Test accuracy:", round(accuracy * 100, 1), "%\\n")
cat("(Baseline: 50% if guessing randomly)")`,

  practiceInstructions: `
## Learning the Concepts

### \`sample()\` and \`set.seed()\` — Random Splitting

\`sample(1:n, size = k)\` draws \`k\` random integers from 1 to n without replacement. These become row indices for the training set. The remaining indices (via negative indexing) form the test set:

\`\`\`r
set.seed(42)                              # reproducible randomness
train_idx <- sample(1:100, size = 80)     # 80 random row indices
train <- data[train_idx, ]                # rows IN the sample
test  <- data[-train_idx, ]               # rows NOT in the sample
\`\`\`

\`set.seed(42)\` ensures the same random split every time you run the code. Without it, you'd get different train/test splits on each run, making results non-reproducible.

### Why 80/20?

The 80/20 split is a common default. 80% gives the model enough data to learn reliable patterns; 20% gives enough test games for the evaluation metrics to be stable. Other splits (70/30, 90/10) work too — the tradeoff is between having enough training data to fit well and enough test data to evaluate honestly.

### Log Loss — A Proper Scoring Rule

Log loss (also called binary cross-entropy) is the standard metric for probabilistic predictions:

\`\`\`
log_loss = -mean(y * log(p) + (1-y) * log(1-p))
\`\`\`

Notice it's the *negative* of the mean log-likelihood. The negative sign flips the convention: **lower log loss is better** (while higher log-likelihood is better).

Why log loss over accuracy?

| Model A: predicts 51% for every game | Model B: predicts 90% for strong favorites, 55% for toss-ups |
|---------------------------------------|--------------------------------------------------------------|
| Accuracy might be decent | Accuracy might be similar |
| Log loss: terrible — barely better than random | Log loss: much better — confident and usually right |

Log loss rewards calibrated confidence. A model that says "this is 90% likely" and is right 90% of the time gets a better log loss than one that hedges everything at 55%.

### Accuracy — Simple but Blunt

\`\`\`r
predicted_win <- as.integer(test_prob > 0.5)  # 1 if model favors home
accuracy <- mean(predicted_win == test$h_win) # fraction correct
\`\`\`

This converts probabilities to binary picks (does the model favor the home team?) and checks how often the pick was right. It's easy to interpret but throws away all the probability information — a 51% prediction and a 99% prediction are treated identically.

### Negative Indexing in R

R's negative indexing excludes elements:

\`\`\`r
x <- c(10, 20, 30, 40, 50)
x[c(1, 3)]   # elements 1 and 3: c(10, 30)
x[-c(1, 3)]  # everything EXCEPT 1 and 3: c(20, 40, 50)
\`\`\`

This is how \`data[-train_idx, ]\` gets the test set — it takes all rows whose index is NOT in \`train_idx\`.

---

Now implement the train/test split and evaluation yourself.
`,

  scaffoldCode: `# Create an 80/20 train/test split
# Hint: set.seed(42); train_idx <- sample(1:n, size = floor(0.8 * n))
# Hint: train <- data[train_idx, ]; test <- data[-train_idx, ]


# Refit BT model on training data only
# Hint: same pattern as step 4, but use train$home_team, train$away_team, train$h_win


# Mean-center the training ratings
# Hint: ratings <- setNames(fit$par, all_teams); ratings <- ratings - mean(ratings)


# Predict on test set: compute probability for each test game
# Hint: diff <- ratings[test$home_team] - ratings[test$away_team]; prob <- 1 / (1 + exp(-diff))


# Calculate log loss
# Hint: -mean(y * log(p) + (1-y) * log(1-p))
# Remember to clamp p with pmax/pmin first


# Calculate accuracy
# Hint: mean(as.integer(prob > 0.5) == test$h_win)


# Print results
cat("Train games:", nrow(train), "| Test games:", nrow(test), "\\n")
cat("Test log loss:", round(log_loss, 4), "\\n")
cat("Test accuracy:", round(accuracy * 100, 1), "%\\n")
cat("(Baseline: 50% if guessing randomly)")`,

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
}`,
};

export default step5;
