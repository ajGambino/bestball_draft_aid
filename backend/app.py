import requests
import pandas as pd
import json
from flask import Flask, jsonify
from flask_cors import CORS
from rapidfuzz import process

app = Flask(__name__)
CORS(app)

# Define the path to the CSV file
csv_file_path = 'csvs/draft_table.csv'

# Load the CSV into a DataFrame
draft_table_df = pd.read_csv(csv_file_path)

# Make the API call
api_url = "https://api.draftkings.com/draftgroups/v1/draftgroups/105454/draftables"
response = requests.get(api_url)
data = response.json()

# Extract relevant fields from the API response
draftables_info = []
for item in data.get("draftables", []):
    draftable_info = {
        "displayName": item.get("displayName"),
        "playerImage160": item.get("playerImage160")
    }
    draftables_info.append(draftable_info)

# Convert the list to a DataFrame
draftables_df = pd.DataFrame(draftables_info)

# Normalize player names for fuzzy matching
draft_table_df['normalized_name'] = draft_table_df['Name'].str.lower().str.replace(r'\W', '', regex=True)
draftables_df['normalized_name'] = draftables_df['displayName'].str.lower().str.replace(r'\W', '', regex=True)

# Fuzzy matching function
def match_players(name, choices):
    match, score = process.extractOne(name, choices)
    return match, score

# Apply fuzzy matching
matches = draftables_df['normalized_name'].apply(lambda x: match_players(x, draft_table_df['normalized_name']))
draftables_df['match'] = matches.apply(lambda x: x[0])
draftables_df['score'] = matches.apply(lambda x: x[1])

# Merge DataFrames on the normalized names
merged_df = draft_table_df.merge(draftables_df, left_on='normalized_name', right_on='match', how='left')

# Drop unnecessary columns and duplicates
merged_df = merged_df.drop(columns=['displayName', 'position_y', 'normalized_name_x', 'normalized_name_y', 'match', 'score'], errors='ignore')
merged_df = merged_df.drop_duplicates(subset='Name')

# Convert the DataFrame to JSON and handle any remaining NaN values
def df_to_json(df):
    return json.loads(df.to_json(orient='records'))

@app.route('/')
def home():
    return "Welcome to Draft Caddy!"

@app.route('/api/draft-table')
def get_draft_table():
    return jsonify(df_to_json(merged_df))

if __name__ == '__main__':
    # Get the port from the environment, or use 5000 as a default
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
