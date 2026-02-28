import { LessonStep } from '../types';

const step3: LessonStep = {
  id: 'step-3',
  title: 'The Log-Likelihood',

  previewInstructions: `
## What Are We Building?

Now we need a way to *score* a set of ratings — to measure how well any proposed set of team ratings explains the actual game results. That scoring function is the **log-likelihood**, and it's the heart of the Bradley-Terry model.

The idea: given a set of ratings, we can compute the probability the model assigns to every game's actual outcome. If the model gave a 90% probability to each game that actually happened, the ratings are excellent. If it gave 50% to everything (coin flips), the ratings are useless. The log-likelihood is the sum of the log-probabilities across all games — higher is better.

Why log? Because probabilities multiply (the joint probability of independent outcomes is their product), and multiplying thousands of small probabilities together produces astronomically tiny numbers that computers can't represent. Taking the log converts multiplication to addition, keeping the numbers in a manageable range without changing which set of ratings is best.

The function below takes four arguments: a named vector of ratings, vectors of home and away team names, and a vector of actual outcomes (1 = home win, 0 = home loss). It computes the predicted probability for each game, then sums the log-probabilities. We test it with dummy ratings (all zeros) as a sanity check — if every game is a coin flip, the log-likelihood should be approximately \`n * log(0.5)\`.
`,

  solutionCode: `# Bradley-Terry log-likelihood function
bt_log_likelihood <- function(ratings, teams_home, teams_away, outcomes) {
  diff <- ratings[teams_home] - ratings[teams_away]
  prob <- 1 / (1 + exp(-diff))
  # Clamp to avoid log(0)
  prob <- pmax(pmin(prob, 1 - 1e-10), 1e-10)
  sum(outcomes * log(prob) + (1 - outcomes) * log(1 - prob))
}

# Build a vector of all team names
all_teams <- sort(unique(c(model_data$home_team, model_data$away_team)))
cat("Number of teams:", length(all_teams), "\\n\\n")

# Test with dummy ratings (all zeros = every game is a coin flip)
dummy_ratings <- setNames(rep(0, length(all_teams)), all_teams)

ll_dummy <- bt_log_likelihood(
  dummy_ratings,
  model_data$home_team,
  model_data$away_team,
  model_data$h_win
)

cat("Log-likelihood with equal ratings:", round(ll_dummy, 1), "\\n")
cat("Expected (n * log(0.5)):", round(nrow(model_data) * log(0.5), 1))`,

  practiceInstructions: `
## Learning the Concepts

### Named Vectors — R's Key-Value Store

A named vector is one of the most powerful data structures in R. It's a regular vector where each element has a name, and you can access elements by name:

\`\`\`r
# Create a named vector
ratings <- c(KC = 0.5, BUF = 0.3, NYJ = -0.2)

# Access by name
ratings["KC"]       # 0.5
ratings[c("KC", "BUF")]  # 0.5, 0.3
\`\`\`

The \`setNames()\` function creates named vectors when you have the names and values in separate vectors:

\`\`\`r
values <- c(0, 0, 0)
names <- c("KC", "BUF", "NYJ")
ratings <- setNames(values, names)
\`\`\`

**The key insight for Bradley-Terry**: if \`ratings\` is a named vector and \`teams_home\` is a character vector of team abbreviations, then \`ratings[teams_home]\` looks up each team's rating *by name*. This vectorizes the entire computation — no loops needed.

### The Log-Likelihood Formula

For a single game where the home team's win probability is \`p\` and the actual outcome is \`y\` (1 = home win, 0 = home loss):

\`\`\`
log_lik = y * log(p) + (1 - y) * log(1 - p)
\`\`\`

When \`y = 1\` (home won): simplifies to \`log(p)\` — log of the probability assigned to what happened.
When \`y = 0\` (home lost): simplifies to \`log(1 - p)\` — log of the probability assigned to what happened.

For all games together, we sum: \`sum(y * log(p) + (1 - y) * log(1 - p))\`

### Clamping with \`pmax()\` and \`pmin()\`

A probability of exactly 0 or 1 would make \`log()\` return \`-Inf\`, which breaks the optimizer. We prevent this by clamping:

\`\`\`r
prob <- pmax(pmin(prob, 1 - 1e-10), 1e-10)
\`\`\`

\`pmin(prob, 1 - 1e-10)\` caps probabilities just below 1. \`pmax(..., 1e-10)\` floors them just above 0. The \`p\` in \`pmax\`/\`pmin\` stands for "parallel" — they operate element-wise on vectors, unlike \`max()\`/\`min()\` which return a single value.

### The Sanity Check

With all ratings at zero, every game is a 50/50 coin flip. The log-likelihood should equal \`n * log(0.5)\`:

\`\`\`r
# Each game contributes log(0.5) = -0.693
# Total = number_of_games * -0.693
\`\`\`

If the optimized ratings produce a *higher* log-likelihood than this baseline, the model has learned something — it's doing better than random guessing.

---

Now write the log-likelihood function and test it yourself.
`,

  scaffoldCode: `# Define bt_log_likelihood(ratings, teams_home, teams_away, outcomes)
# 1. Compute diff = ratings[teams_home] - ratings[teams_away]
# 2. Compute prob = 1 / (1 + exp(-diff))
# 3. Clamp prob with pmax/pmin to avoid log(0)
# 4. Return sum(outcomes * log(prob) + (1 - outcomes) * log(1 - prob))


# Build all_teams: sorted unique team names from model_data
# Hint: sort(unique(c(data$col1, data$col2)))


# Create dummy_ratings: all zeros, named with all_teams
# Hint: setNames(rep(0, length(names)), names)


# Test the function with dummy ratings
ll_dummy <- bt_log_likelihood(
  dummy_ratings,
  model_data$home_team,
  model_data$away_team,
  model_data$h_win
)

cat("Log-likelihood with equal ratings:", round(ll_dummy, 1), "\\n")
cat("Expected (n * log(0.5)):", round(nrow(model_data) * log(0.5), 1))`,

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
}`,
};

export default step3;
