from flask import Flask, request, jsonify
import joblib
import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler
import category_encoders as ce
import requests
import traceback

app = Flask(__name__)

# Load the pre-trained model
model = joblib.load('xgboost_model_new.pkl')


def preprocessing(df):
    # df['webGeneratorTool'] = np.where(df['webGeneratorTool'].isna(), True, False)
    # df['secured'] = np.where(df['secured']==True, False, True)
    df['url_count'] = df['urls'].apply(lambda x: len(x))
    df['top3DomainLengths'] = df['top3DomainLengths'].apply(lambda x: np.mean(x))
    
    df[['unescape', 'document_write']] = df['unsafeJSFunctions'].apply(pd.Series)

    columns_to_keep = ['domain', 'domainExtension', 'subdomains',
                       'descriptionPresent', 'descriptionOrKeywordsPresent', 'metaTagCount',
                       'linkTagCount', 'scriptTagCount', 'imgTagCount',
                       'imgAltTagsMissingCount', 'imgAltTagsMissingPercent', 'totalLinkCount',
                       'brokenLinksCount', 'brokenLinkPercent', 'selfLinkingCount',
                       'selfLinkingCountPercent', 'hasFavicon', 'totalSvgCount',
                       'missingSvgAttrCount', 'svgXmlnsMissingPercent', 'footerPresent',
                       'footerLinks', 'footerBrokenLinks', 'formCount', 'domainUrlMatchCount',
                       'domainUrlNotMatchCount', 'usesFreeHostingService', 'top3DomainLengths',
                       'scriptCharacterCount', 'styleCharacterCount', 'url_count', 'unescape',
                       'document_write']

    for column in columns_to_keep:
        if column not in df.columns:
            df[column] = None
    df = df[columns_to_keep]

    return df


def classify_prediction(prob):
    """Classify based on given rules"""
    if prob[0] >= 0.5:
        return 'phishing'
    elif prob[1] >= 0.5:
        return 'legit'
    # elif prob[0] < 0.8 and prob[1] < 0.8:
    #     return 'suspicious'
    # else:
    #     return 'unknown'  # Fallback case


@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Extract data from POST request
        input_data = request.get_json(force=True)
        url_to_check = input_data['sourceurl']
        company = input_data.get('company', 'Other')
        version = input_data.get('version', 2)

        # Fetch data from AWS endpoint
        aws_endpoint = 'http://phish-collector-lb-1814707889.us-east-1.elb.amazonaws.com/sitedata'
        response = requests.get(aws_endpoint, headers={'sourceurl': url_to_check, 'company': company, 'version': version})
        if response.status_code != 200:
            return jsonify({'error': 'Error fetching data from AWS'}), response.status_code
        
        # Process the fetched data
        data = response.json()
        print('***********',data)
        df_data = list(data.values())[0][0]
        df = pd.DataFrame([df_data])

        # Preprocess the input data
        processed_data = preprocessing(df)

        # Predict using the pre-trained model
        prediction_proba = model.predict_proba(processed_data)[0] # Get the probability for both classes

        # Classify based on the new rules
        classification = classify_prediction(prediction_proba)

        # Return the prediction result as JSON
        return jsonify({'prediction': classification, 'probability': prediction_proba.tolist()})
    except Exception as e:
        # Log the error with details
        print("Error:", str(e))
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=7000)
