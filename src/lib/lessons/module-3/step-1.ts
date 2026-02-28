import { LessonStep } from '../types';

const step1: LessonStep = {
  id: 'step-1',
  title: 'Rating Difference Feature',

  previewInstructions: `
## What Are We Building?

In Module 2 we fit a Bradley-Terry model that produces a single rating per team. Now we're going to use those ratings as *features* in regression models that predict game outcomes more precisely.

The first step is creating the key predictor variable: **\`diff_rating\`** — the difference between the home team's BT rating and the away team's BT rating. This single number encodes the overall quality gap between the two teams. A large positive diff_rating means the home team is much stronger; a value near zero means an even matchup; a negative value means the away team is stronger.

Why is this useful? Because the BT rating captures something fundamentally different from the OS/DS (offensive/defensive strength) ratios we built in Module 1. The BT rating reflects *win/loss outcomes* — who actually beats whom — while OS/DS reflects *scoring patterns* — how many points teams score and allow. A team might have mediocre raw scoring numbers but consistently win close games. The BT rating captures that clutch factor; the OS/DS numbers miss it.

By combining diff_rating with the OS/DS features, the regression models in the next steps get the best of both worlds: a strength-of-opponent adjusted win rate signal (BT) *and* granular scoring efficiency data (OS/DS).

The code below adds diff_rating to model_data, then plots it against the actual home margin of victory to see how well rating differences predict game outcomes.
`,

  solutionCode: `suppressPackageStartupMessages(library(ggplot2))

# Add BT rating difference to model_data
model_data$diff_rating <- bt_ratings[model_data$home_team] - bt_ratings[model_data$away_team]

# Scatter plot: diff_rating vs actual margin
ggplot(model_data, aes(x = diff_rating, y = h_mov)) +
  geom_point(alpha = 0.15, color = "#38bdf8") +
  geom_smooth(method = "lm", color = "#f59e0b", se = FALSE) +
  labs(
    title = "BT Rating Difference vs Home Margin of Victory",
    x = "Rating Difference (Home - Away)",
    y = "Home Margin of Victory"
  ) +
  theme_minimal() +
  theme(plot.title = element_text(face = "bold"))

cat("\\nCorrelation:", round(cor(model_data$diff_rating, model_data$h_mov), 3))`,

  practiceInstructions: `
## Learning the Concepts

### Named Vector Column Creation

In Step 4 of Module 2, you created \`bt_ratings\` — a named vector where each team abbreviation maps to a rating. The powerful thing about named vectors is that you can use them to look up values for an entire column at once:

\`\`\`r
# bt_ratings is: c(ARI = -0.31, ATL = 0.05, BAL = 0.28, BUF = 0.35, ...)

# Look up one team's rating
bt_ratings["KC"]   # returns KC's rating

# Look up ratings for an entire column of team names
bt_ratings[model_data$home_team]   # returns a vector of ratings, one per game
\`\`\`

This means creating the diff_rating column is a one-liner:

\`\`\`r
model_data$diff_rating <- bt_ratings[model_data$home_team] - bt_ratings[model_data$away_team]
\`\`\`

No loops, no joins, no merging. Named vector indexing is one of R's most elegant features for this kind of lookup operation.

### \`cor()\` — Pearson Correlation

\`cor(x, y)\` computes the Pearson correlation coefficient between two numeric vectors. The result ranges from -1 to +1:

- **+1**: Perfect positive linear relationship
- **0**: No linear relationship
- **-1**: Perfect negative linear relationship

\`\`\`r
cor(model_data$diff_rating, model_data$h_mov)
\`\`\`

A correlation of 0.25–0.35 between a single feature and an outcome variable is actually quite good in sports analytics. NFL games have enormous variance (injuries, weather, randomness), so even a modest correlation represents real predictive signal.

### \`geom_smooth(method = "lm")\` — Trend Lines

\`geom_smooth()\` fits a smoothed line through scatter plot data. With \`method = "lm"\`, it fits an ordinary linear regression:

\`\`\`r
geom_smooth(method = "lm", color = "#f59e0b", se = FALSE)
\`\`\`

- \`method = "lm"\` uses linear regression (a straight line)
- \`se = FALSE\` hides the confidence band around the line
- The slope of this line tells you: for each unit increase in rating difference, how much does the home margin increase?

The scatter plot should show a positive-sloping line: as the home team's rating advantage increases, they tend to win by more points. The cloud of points around the line shows the variance — individual games are noisy, but the trend is clear.

### Why Combine BT with OS/DS?

You might wonder: if BT ratings already predict wins, why add OS/DS features?

The answer is that BT and OS/DS capture *different information*:

| Feature | What it captures | Limitation |
|---------|-----------------|------------|
| \`diff_rating\` | Who wins games (opponent-adjusted) | Doesn't know *how* they win |
| \`home_os\`, \`away_os\` | Scoring efficiency | Doesn't account for opponent quality |
| \`home_ds\`, \`away_ds\` | Defensive efficiency | Same limitation |

A regression model with all five features can learn to weight each signal appropriately. Maybe BT ratings are the strongest predictor, but OS/DS add incremental value by distinguishing between teams that win shootouts vs. defensive slugfests.

---

Now add the diff_rating feature and explore its relationship with game outcomes.
`,

  scaffoldCode: `# Load ggplot2
# Hint: suppressPackageStartupMessages(library(ggplot2))


# Add diff_rating to model_data using named vector indexing
# Hint: data$new_col <- named_vec[data$col1] - named_vec[data$col2]


# Scatter plot: diff_rating vs h_mov with a linear trend line
# Hint: ggplot(data, aes(x = col1, y = col2)) + geom_point(alpha = 0.15) + geom_smooth(method = "lm", se = FALSE)
# Add: labs(title = "...", x = "...", y = "...") + theme_minimal()


# Print the correlation
cat("\\nCorrelation:", round(cor(model_data$diff_rating, model_data$h_mov), 3))`,

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

export default step1;
