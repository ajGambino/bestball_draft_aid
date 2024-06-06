import requests
import json
import pandas as pd
from flask import Flask, jsonify
from flask_cors import CORS
from rapidfuzz import process
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

def match_players(name, choices):
    result = process.extractOne(name, choices)
    match, score, _ = result  # Extract the match, score, and ignore the index
    return match, score

# Apply fuzzy matching
matches = draftables_df['normalized_name'].apply(lambda x: match_players(x, draft_table_df['normalized_name']))

# Extract matched names and scores
draftables_df['match'] = matches.apply(lambda x: x[0])
draftables_df['score'] = matches.apply(lambda x: x[1])

# Merge DataFrames on the matched names
merged_df = pd.merge(draft_table_df, draftables_df, left_on='normalized_name', right_on='match', suffixes=('_x', '_y'))

# Drop unnecessary columns
merged_df = merged_df.drop(columns=['displayName', 'position_y', 'normalized_name_x', 'normalized_name_y', 'match', 'score'])

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
