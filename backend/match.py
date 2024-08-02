import pandas as pd
from fuzzywuzzy import process

# Define the paths to the CSV files relative to the current directory (backend)
teams_csv_path = './csvs/teams.csv'
adp_csv_path = './csvs/adp.csv'

# Load the CSV files
teams_df = pd.read_csv(teams_csv_path, header=None)
adp_df = pd.read_csv(adp_csv_path)

# Special cases for name normalization
special_cases = {
    'A. St. Brown': 'Amon-Ra St. Brown',
    'A. Brown': 'A.J. Brown',
    'D. Moore': 'D.J. Moore',
    'D. Samuel Sr.': 'Deebo Samuel',
    'D. Swift': "D'Andre Swift",
    # Add more mappings as needed
}

def normalize_name(name):
    return special_cases.get(name, name)

def extract_players(teams_df):
    players = []
    for col in teams_df.columns:
        column = teams_df[col].dropna()
        for i in range(2, len(column), 5):  # Start at 2nd index and step by 5
            player = {
                'Normalized Name': normalize_name(column.iloc[i]),
                'Position': column.iloc[i + 1],
                'Team': column.iloc[i + 2]
            }
            players.append(player)
    return pd.DataFrame(players)

def match_player(row):
    name = row['Normalized Name']
    position = row['Position']
    team = row['Team']
    matched_player = adp_df[(adp_df['Name'] == name) & 
                            (adp_df['Position'] == position) & 
                            (adp_df['Team'] == team)]
    if not matched_player.empty:
        return matched_player.iloc[0]
    return None

def fuzzy_match(name, choices):
    match, score = process.extractOne(name, choices)
    return match if score > 80 else None

# Extract players from the teams data
players_df = extract_players(teams_df)

# Match players and calculate exposures
player_exposures = {}
for _, row in players_df.iterrows():
    matched_player = match_player(row)
    if matched_player is None:
        matched_player = fuzzy_match(row['Normalized Name'], adp_df['Name'].tolist())
        if matched_player:
            matched_player = adp_df[adp_df['Name'] == matched_player].iloc[0]
    
    if matched_player is not None:
        player_name = matched_player['Name']
        if player_name not in player_exposures:
            player_exposures[player_name] = 0
        player_exposures[player_name] += 1

# Merge exposures into adp_df
adp_df['Exposure'] = adp_df['Name'].map(player_exposures).fillna(0).astype(int)

# Output the final draft_table.csv
draft_table2 = adp_df[['Name', 'Team', 'Position', 'ETR Rank', 'ADP', 'ADP Differential', 'Exposure']]
draft_table2.to_csv('./csvs/draft_table2.csv', index=False)
