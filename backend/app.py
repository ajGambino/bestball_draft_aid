import requests
import json
import pandas as pd
from flask import Flask, jsonify
from flask_cors import CORS
from rapidfuzz import process, fuzz
import os

app = Flask(__name__)
CORS(app)

# Define the paths to the CSV files
csv_file_path = os.path.join(os.path.dirname(__file__), 'csvs', 'draft_table.csv')
matchups_csv_path = os.path.join(os.path.dirname(__file__), 'csvs', 'matchups.csv')

# Load the CSV files into DataFrames
draft_table_df = pd.read_csv(csv_file_path)
matchups_df = pd.read_csv(matchups_csv_path)

# Fix NaN error for JSON
draft_table_df = draft_table_df.where(pd.notnull(draft_table_df), None)
matchups_df = matchups_df.where(pd.notnull(matchups_df), None)

# Load draftables data from NFL image data file
from nfl_img import draftables_dict

draftables_df = pd.DataFrame.from_dict(draftables_dict, orient='index')

# Normalize names for better matching
draft_table_df['normalized_name'] = draft_table_df['Name'].str.lower().str.replace(r'[^a-z]', '', regex=True)
draftables_df['normalized_name'] = draftables_df['displayName'].str.lower().str.replace(r'[^a-z]', '', regex=True)

# Function to get the best match for each player
def get_best_match(name, choices):
    result = process.extract(name, choices, scorer=fuzz.ratio)
    if result:
        match, score, idx = max(result, key=lambda x: x[1])
        return match, score, idx
    return None, 0, -1

# Create a mapping from draft table normalized names to their rows
draft_table_name_to_row = draft_table_df.set_index('normalized_name').T.to_dict()


# Store the best matches in a list
best_matches = []

for idx, row in draftables_df.iterrows():
    name = row['normalized_name']
    match, score, match_idx = get_best_match(name, draft_table_df['normalized_name'].tolist())
    if score > 80:  # Arbitrary threshold for a good match, adjust as needed
        matched_row = draft_table_name_to_row.get(match)
        if matched_row:
            best_matches.append({**matched_row, **row})



# Create a new DataFrame from the best matches
best_matches_df = pd.DataFrame(best_matches)

# Drop unnecessary columns
columns_to_drop = ['displayName', 'normalized_name', 'match', 'score']
columns_to_drop = [col for col in columns_to_drop if col in best_matches_df.columns]

merged_df = best_matches_df.drop(columns=columns_to_drop)

@app.route('/')
def home():
    return "Welcome to Draft Caddy!"

# Route to serve draft table data
@app.route('/api/draft-table')
def get_draft_table():
    return jsonify(merged_df.to_dict(orient='records'))

# Route to serve matchups data
@app.route('/api/matchups')
def get_matchups():
    return jsonify(matchups_df.to_dict(orient='records'))

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
