import csv
import pandas as pd

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

# Usage
input_file_clean = 'teams.csv'
output_file_clean = 'teams2.csv'
extract_player_data(input_file_clean, output_file_clean)

# Read CSV files into DataFrames
updated_teams_df = pd.read_csv('teams2.csv')
dk_df = pd.read_csv('DK2.csv')

# Apply the function to update Player Name in updated_teams_df
updated_teams_df['Player Name'] = updated_teams_df.apply(find_matching_player, axis=1)

# Fill NaN values with original Player Name
updated_teams_df['Player Name'].fillna(updated_teams_df['Player Name'], inplace=True)

# Write the updated DataFrame to a new CSV file
updated_teams_df.to_csv('rosters.csv', index=False)
