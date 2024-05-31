from flask import Flask, jsonify
import pandas as pd
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)
 
# Define the path to the CSV file
csv_file_path = os.path.join(os.path.dirname(__file__), 'csvs', 'draft_table.csv')

# Load draft_table.csv into a DataFrame
draft_table_df = pd.read_csv(csv_file_path)

# Fix NaN error for JSON
draft_table_df = draft_table_df.where(pd.notnull(draft_table_df), None)

@app.route('/')
def home():
    return "Welcome to Flask!"

# Route to serve draft table data
@app.route('/api/draft-table')
def get_draft_table():
    # Convert DataFrame to JSON and return
    return jsonify(draft_table_df.to_dict(orient='records'))

if __name__ == '__main__':
    # Get the port from the environment, or use 5000 as a default
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
