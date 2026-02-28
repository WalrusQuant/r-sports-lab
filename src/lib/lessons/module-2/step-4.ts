import { LessonStep } from '../types';

const step4: LessonStep = {
  id: 'step-4',
  title: 'Fitting with optim()',

  previewInstructions: `
## What Are We Building?

We have a log-likelihood function that scores any set of ratings. Now we need to find the *best* ratings — the ones that maximize the log-likelihood. This is where \`optim()\` comes in.

\`optim()\` is R's general-purpose numerical optimizer. You give it a starting point (our 32 zeros), a function to optimize (our log-likelihood), and an algorithm (BFGS — a fast gradient-based method). It iteratively adjusts the ratings to find the combination that maximizes the log-likelihood. Think of it as hill-climbing in 32-dimensional space.

The critical trick is \`control = list(fnscale = -1)\`. By default, \`optim()\` *minimizes* its objective function. Setting \`fnscale = -1\` flips the sign, turning minimization into maximization. Since we want to maximize the log-likelihood, this is essential.

After optimization, the raw ratings are uninterpretable on their own because the logistic function only cares about *differences* between ratings. Adding 10 to every team's rating wouldn't change any prediction. To make the ratings comparable, we **mean-center** them — subtract the average rating from each. This anchors the scale at zero: positive ratings mean "above average," negative means "below average."

The code below runs the optimization and prints the top 5 and bottom 5 teams. These are the Bradley-Terry power rankings for 2015–present.
`,

  solutionCode: `# Wrapper for optim: takes unnamed vector, returns log-likelihood
bt_optim_fn <- function(par) {
  names(par) <- all_teams
  bt_log_likelihood(par, model_data$home_team, model_data$away_team, model_data$h_win)
}

# Maximize log-likelihood with BFGS
fit <- optim(
  par = rep(0, length(all_teams)),
  fn = bt_optim_fn,
  method = "BFGS",
  control = list(fnscale = -1)
)

# Extract and mean-center ratings
bt_ratings <- setNames(fit$par, all_teams)
bt_ratings <- bt_ratings - mean(bt_ratings)

cat("Converged:", fit$convergence == 0, "\\n")
cat("Log-likelihood:", round(fit$value, 1), "\\n\\n")

# Top and bottom 5
sorted <- sort(bt_ratings, decreasing = TRUE)
cat("Top 5 teams:\\n")
for (i in 1:5) cat(sprintf("  %s: %+.3f\\n", names(sorted)[i], sorted[i]))
cat("\\nBottom 5 teams:\\n")
for (i in (length(sorted)-4):length(sorted)) cat(sprintf("  %s: %+.3f\\n", names(sorted)[i], sorted[i]))`,

  practiceInstructions: `
## Learning the Concepts

### \`optim()\` — R's General-Purpose Optimizer

\`optim()\` finds the parameter values that minimize (or maximize) a given function. The basic signature is:

\`\`\`r
optim(
  par     = initial_values,    # starting point (numeric vector)
  fn      = objective_fn,      # function to optimize
  method  = "BFGS",            # algorithm choice
  control = list(fnscale = -1) # options
)
\`\`\`

**\`par\`**: The starting values for the parameters. For Bradley-Terry, we start with all zeros (every team rated equally). The length of this vector defines how many parameters are being optimized — 32, one per team.

**\`fn\`**: The objective function. It must take a single numeric vector as its first argument and return a single scalar. Our wrapper \`bt_optim_fn\` takes the unnamed parameter vector, assigns team names, and calls \`bt_log_likelihood()\`.

**\`method = "BFGS"\`**: The Broyden-Fletcher-Goldfarb-Shanno algorithm. It uses the gradient (slope) of the objective function to decide which direction to move. BFGS is efficient for smooth functions like the log-likelihood — it typically converges in a few hundred iterations even with 32 parameters.

**\`control = list(fnscale = -1)\`**: This is critical. By default \`optim()\` *minimizes*. Setting \`fnscale = -1\` multiplies the objective by -1 internally, effectively turning it into a maximization problem. Since we want to *maximize* the log-likelihood, we need this.

### Interpreting \`optim()\` Output

\`optim()\` returns a list with several components:

\`\`\`r
fit$par          # the optimal parameter values (our ratings)
fit$value        # the objective function value at the optimum
fit$convergence  # 0 means success, anything else is a warning
fit$counts       # how many function/gradient evaluations were needed
\`\`\`

Always check \`fit$convergence == 0\`. If it's nonzero, the optimizer didn't fully converge and the results may be unreliable.

### Mean-Centering

The logistic function only uses *differences* between ratings: \`P = 1 / (1 + exp(-(r_home - r_away)))\`. If you add a constant to every team's rating, the differences don't change, so the predictions don't change. This means the raw output from \`optim()\` is arbitrarily shifted — team ratings might all be centered around 3.7 or -2.1.

Mean-centering fixes this by subtracting the average:

\`\`\`r
bt_ratings <- bt_ratings - mean(bt_ratings)
\`\`\`

After centering, the mean rating is exactly 0. A team at +0.4 is 0.4 units above average; a team at -0.3 is 0.3 units below. The scale becomes interpretable.

### \`sprintf()\` — Formatted String Output

\`sprintf()\` works like printf in C: you write a format string with placeholders, and R fills them in:

\`\`\`r
sprintf("%s: %+.3f", "KC", 0.423)   # "KC: +0.423"
sprintf("%s: %+.3f", "NYJ", -0.312) # "NYJ: -0.312"
\`\`\`

- \`%s\` — string placeholder
- \`%+.3f\` — floating-point number with 3 decimal places, always showing the sign (\`+\` or \`-\`)

---

Now run the optimization and extract the ratings yourself.
`,

  scaffoldCode: `# Create a wrapper function for optim
# It takes an unnamed parameter vector, assigns names, and calls bt_log_likelihood
# Hint: wrapper <- function(par) { names(par) <- all_teams; bt_log_likelihood(par, ...) }


# Run optim() to maximize the log-likelihood
# Hint: fit <- optim(par = rep(0, n), fn = wrapper, method = "BFGS", control = list(fnscale = -1))


# Extract ratings and mean-center them
# Hint: bt_ratings <- setNames(fit$par, all_teams)
# Hint: bt_ratings <- bt_ratings - mean(bt_ratings)


# Check convergence and print the log-likelihood
cat("Converged:", fit$convergence == 0, "\\n")
cat("Log-likelihood:", round(fit$value, 1), "\\n\\n")

# Print top 5 and bottom 5 teams
sorted <- sort(bt_ratings, decreasing = TRUE)
cat("Top 5 teams:\\n")
for (i in 1:5) cat(sprintf("  %s: %+.3f\\n", names(sorted)[i], sorted[i]))
cat("\\nBottom 5 teams:\\n")
for (i in (length(sorted)-4):length(sorted)) cat(sprintf("  %s: %+.3f\\n", names(sorted)[i], sorted[i]))`,

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
}`,
};

export default step4;
