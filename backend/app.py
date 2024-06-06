from flask import Flask, jsonify
import pandas as pd
from flask_cors import CORS
import os
from rapidfuzz import process
import json

app = Flask(__name__)
CORS(app)

# Import player images
from nfl_img import draftables_dict

# Define the path to the CSV file
csv_file_path = os.path.join(os.path.dirname(__file__), 'csvs', 'draft_table.csv')
matchups_csv_path = os.path.join(os.path.dirname(__file__), 'csvs', 'matchups.csv')

# Load CSV into DataFrame
draft_table_df = pd.read_csv(csv_file_path)
matchups_df = pd.read_csv(matchups_csv_path)

# Convert draftables_dict to a DataFrame
player_images_df = pd.DataFrame.from_dict(draftables_dict, orient='index')

# Normalize names in player_images_df for better matching
player_images_df['normalized_name'] = player_images_df['displayName'].str.replace(r'\W+', '', regex=True).str.lower()

# Normalize names in draft_table_df for better matching
draft_table_df['normalized_name'] = draft_table_df['Name'].str.replace(r'\W+', '', regex=True).str.lower()

# Fuzzy matching function using rapidfuzz
def fuzzy_merge(df1, df2, key1, key2, threshold=90):
    matches = []
    for name in df1[key1]:
        match = process.extractOne(name, df2[key2], score_cutoff=threshold)
        matches.append(match)
    
    df1['match'] = [match[0] if match else None for match in matches]
    df1['score'] = [match[1] if match else None for match in matches]
    
    return df1

# Perform fuzzy merge
merged_df = fuzzy_merge(draft_table_df, player_images_df, 'normalized_name', 'normalized_name')

# Merge with original player_images_df to get image URLs
merged_df = merged_df.merge(player_images_df[['normalized_name', 'playerImage160']], left_on='match', right_on='normalized_name', how='left')

# Drop unnecessary columns
merged_df = merged_df.drop(columns=['displayName', 'position_y', 'normalized_name_x', 'normalized_name_y', 'match', 'score'])

# Replace NaN with None to make it JSON serializable
merged_df = merged_df.where(pd.notnull(merged_df), None)

# Convert the DataFrame to JSON and handle any remaining NaN values
def df_to_json(df):
    return json.loads(df.to_json(orient='records'))

@app.route('/')
def home():
    return "Welcome to Draft Caddy!"

# Route to serve draft table data
@app.route('/api/draft-table')
def get_draft_table():
    # Convert DataFrame to JSON and return
    return jsonify(df_to_json(merged_df))

# Route to serve matchups data
@app.route('/api/matchups')
def get_matchups():
    # Convert DataFrame to JSON and return
    return jsonify(df_to_json(matchups_df))

if __name__ == '__main__':
    # Get the port from the environment, or use 5000 as a default
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
