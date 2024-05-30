from flask import Flask, jsonify
import pandas as pd

app = Flask(__name__)

# Load draft_table.csv into a DataFrame
draft_table_df = pd.read_csv(r"C:\Users\kenco\OneDrive\Documents\GitHub\bestball_draft_aid\backend\csvs\draft_table.csv")


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
