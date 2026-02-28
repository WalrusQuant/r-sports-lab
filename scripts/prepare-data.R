# prepare-data.R
# Downloads NFL schedule data from nflverse and trims it for the web app.
# Run once: Rscript scripts/prepare-data.R

library(readr)
library(dplyr)

cat("Downloading NFL schedule data from nflverse...\n")

# nflverse publishes CSV files on GitHub releases
url <- "https://github.com/nflverse/nfldata/raw/master/data/games.csv"
games_raw <- read_csv(url, show_col_types = FALSE)

cat("Raw data:", nrow(games_raw), "rows,", ncol(games_raw), "columns\n")

# Trim to essential columns, regular season, 2006+
games <- games_raw %>%
  filter(
    season >= 2006,
    game_type == "REG",
    !is.na(home_score)  # exclude unplayed games
  ) %>%
  select(
    season,
    week,
    game_type,
    home_team,
    away_team,
    home_score,
    away_score,
    home_rest,
    away_rest,
    result
  )

cat("Trimmed data:", nrow(games), "rows,", ncol(games), "columns\n")

# Write to public/data
output_path <- "public/data/nfl_schedules.csv"
write_csv(games, output_path)

file_size <- file.size(output_path)
cat("Saved to", output_path, "(", round(file_size / 1024), "KB )\n")
cat("Done!\n")
