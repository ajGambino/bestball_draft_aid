import pandas as pd

# Read the adp.csv file
adp_df = pd.read_csv('adp.csv')

# Drop the unnecessary columns
adp_df = adp_df.drop(columns=['ETR Pos Rank', 'ADP Pos Rank', 'Id'])

# Rename the "ETR Rank" column to "Rank"
adp_df = adp_df.rename(columns={'ETR Rank': 'Rank'})

# Read the matchups.csv file
matchups_df = pd.read_csv('matchups.csv')

# Merge the two dataframes on the 'Team' column
merged_df = pd.merge(adp_df, matchups_df, on='Team', how='left')

# Output the merged dataframe to a new CSV file called draft_table.csv
merged_df.to_csv('draft_table.csv', index=False)

# Read the rosters.csv file
rosters_df = pd.read_csv('rosters.csv')

# Calculate exposure for each player
exposure_counts = rosters_df['Player Name'].value_counts() / len(rosters_df) * 100

# Add the exposure column to draft_table.csv
merged_df['Exposure'] = merged_df['Name'].map(exposure_counts)

# Fill NaN values with 0
merged_df['Exposure'] = merged_df['Exposure'].fillna(0)

# Output the updated dataframe to the same draft_table.csv
merged_df.to_csv('draft_table.csv', index=False)

print("draft_table.csv has been updated with Exposure column.")
