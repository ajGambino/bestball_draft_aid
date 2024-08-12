import csv
import pandas as pd
import os

# Define the directory containing CSV files
csvs_dir = "C:\\Users\\kenco\\GitHub\\bestball_draft_aid\\backend\\csvs"

# Function to extract player data from teams.csv
def extract_player_data(input_file, output_file):
    with open(input_file, 'r') as infile, open(output_file, 'w', newline='') as outfile:
        reader = csv.reader(infile)
        writer = csv.writer(outfile)
        
        # Read the header line to get the team names
        headers = next(reader)
        num_teams = len(headers)
        
        # Writing the header for the output CSV with "Team Number" as the first column header
        writer.writerow(['Team Number', 'Player Name', 'Position', 'Team'])

        # Skip the team size line (e.g., 4, 7, 11, etc.)
        team_sizes = next(reader)

        # Initialize a buffer to hold rows for a complete set of player data
        buffer = []

        for row in reader:
            buffer.append(row)
            if len(buffer) == 5:  # We have a complete set of 5 rows
                for i in range(num_teams):
                    player_name = buffer[0][i]
                    position = buffer[1][i]
                    team_line = buffer[2][i]
                    team = team_line.split()[0]

                    # Write the filtered data to the output CSV
                    writer.writerow([headers[i], player_name, position, team])
                buffer = []  # Reset the buffer

        # Process any remaining rows in the buffer (last player)
        if buffer:
            for i in range(num_teams):
                player_name = buffer[0][i]
                position = buffer[1][i]
                team_line = buffer[2][i]
                team = team_line.split()[0]

                # Write the filtered data to the output CSV
                writer.writerow([headers[i], player_name, position, team])

# Function to find matching player name in DK.csv
def find_matching_player(row):
    last_name = row['Player Name'].split()[-1]
    team = row['Team']
    position = row['Position']
    
    # Filter DK.csv for matching last name, team, and position
    matching_players = dk_df[(dk_df['Name'].str.split().str[-1] == last_name) & (dk_df['Team'] == team) & (dk_df['Position'] == position)]
     
    # If multiple matching players found, choose the first one
    if not matching_players.empty:
        return matching_players.iloc[0]['Name']
    else:
        # No matching player found, return None
        return None

# Define absolute paths to CSV files
adp_csv = os.path.join(csvs_dir, 'adp.csv')
matchups_csv = os.path.join(csvs_dir, 'matchups.csv')
teams_csv = os.path.join(csvs_dir, 'teams.csv')
dk_csv = os.path.join(csvs_dir, 'DK2.csv')

# Read the adp.csv file
adp_df = pd.read_csv(adp_csv)

# Drop the unnecessary columns
adp_df = adp_df.drop(columns=['ETR Pos Rank', 'ADP Pos Rank', 'Id'])

# Rename the "ETR Rank" column to "Rank"
adp_df = adp_df.rename(columns={'ETR Rank': 'Rank'})

# Read the matchups.csv file
matchups_df = pd.read_csv(matchups_csv)

# Merge the two dataframes on the 'Team' column
merged_df = pd.merge(adp_df, matchups_df, on='Team', how='left')

# Output the merged dataframe to a new CSV file called draft_table.csv
merged_df.to_csv(os.path.join(csvs_dir, 'draft_table.csv'), index=False)

# Extract player data from teams.csv to teams2.csv
input_file_clean = teams_csv
output_file_clean = os.path.join(csvs_dir, 'teams2.csv')
extract_player_data(input_file_clean, output_file_clean)

# Read teams2.csv and DK2.csv
updated_teams_df = pd.read_csv(output_file_clean)
dk_df = pd.read_csv(dk_csv)

# Apply the function to update Player Name in updated_teams_df
updated_teams_df['Player Name'] = updated_teams_df.apply(find_matching_player, axis=1)

# Fill NaN values with original Player Name
updated_teams_df['Player Name'].fillna(updated_teams_df['Player Name'], inplace=True)

# Write the updated DataFrame to a new CSV file called rosters.csv
updated_teams_df.to_csv(os.path.join(csvs_dir, 'rosters.csv'), index=False)

# Read the rosters.csv file
rosters_df = pd.read_csv(os.path.join(csvs_dir, 'rosters.csv'))

# Calculate exposure for each player
total_teams_drafted = len(rosters_df) // 20  # Calculate the total number of teams

exposure_counts = (rosters_df['Player Name'].value_counts() / total_teams_drafted * 100).round(1)

# Add the exposure column to draft_table.csv
merged_df['Exposure'] = merged_df['Name'].map(exposure_counts)

# Fill NaN values with 0
merged_df['Exposure'] = merged_df['Exposure'].fillna(0)

# Output the updated dataframe to the same draft_table.csv
merged_df.to_csv(os.path.join(csvs_dir, 'draft_table.csv'), index=False)

print("draft_table.csv has been updated with Exposure column.")
