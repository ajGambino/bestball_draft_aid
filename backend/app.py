from flask import Flask, jsonify
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load draft_table.csv into a DataFrame
draft_table_df = pd.read_csv(r"C:\Users\kenco\OneDrive\Documents\GitHub\bestball_draft_aid\backend\csvs\draft_table.csv")

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
    app.run(debug=True)
