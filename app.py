from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import re
import pickle  
from preprocess import preprocess_new_data, VOC

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Load the pre-trained model
with open('links_classify.pkl', 'rb') as f:
    model = pickle.load(f)

# Utility function to extract URLs from email text
def extract_urls(email_content):
    urls = re.findall(r'(https?://\S+)', email_content)
    return urls

# Function to preprocess URLs and classify them
def classify_urls(urls):
    results = []
    
    for url in urls:
        # Preprocess the URL data to make it ready for the model
        preprocessed_url = preprocess_new_data([url], VOC)  
        
        # Predict the status of the URL
        prediction = model.predict(preprocessed_url)
        
        # Format the result as either legitimate or illegitimate
        result = {
            'url': url,
            'status': 'Legitimate' if prediction == 1 else 'Illegitimate'
        }
        results.append(result)
    
    return results

# Route to classify URLs extracted from the email content
@app.route('/analyze-urls', methods=['POST'])
def analyze_urls():
    # Extract data from the POST request
    data = request.get_json()
    urls = data.get('urls', [])
    
    # Classify the URLs using the model
    classification_results = classify_urls(urls)
    
    # Return the classification results as JSON
    return jsonify({
        'classification': classification_results
    })

if __name__ == '__main__':
    app.run(debug=True)
