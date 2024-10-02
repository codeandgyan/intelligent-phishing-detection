from flask import Flask, request, jsonify
import requests
from io import BytesIO
import tensorflow as tf
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.applications.resnet50 import preprocess_input
from tensorflow.keras.preprocessing import image
import numpy as np
from pinecone import Pinecone, ServerlessSpec
import time
import os
 
app = Flask(__name__)
 
# Initialize Pinecone
api_key = "1efa3b1d-0137-41b1-b7ba-0cbf19382b38"
pc = Pinecone(api_key=api_key)
 
# Create or connect to a Pinecone index
index_name = 'image-similarity'
if index_name not in pc.list_indexes().names():
    pc.create_index(
        name=index_name,
        dimension=2048,  # Replace with your model dimensions
        metric='cosine',
        spec=ServerlessSpec(cloud='aws', region='us-east-1')
    )
index = pc.Index(index_name)
 
# Load a pre-trained ResNet50 model
model = ResNet50(weights='imagenet', include_top=False, pooling='avg')
 
def load_and_preprocess_image(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    return preprocess_input(img_array)
 
def get_image_embedding(img_path):
    img_array = load_and_preprocess_image(img_path)
    embedding = model.predict(img_array)
    return embedding.flatten()
 
def download_image(url, save_path):
    response = requests.get(url)
    if response.status_code == 200:
        with open(save_path, 'wb') as f:
            f.write(response.content)
        return True
    return False
 
def query_similar_images(query_img_path, top_k=5):
    query_embedding = get_image_embedding(query_img_path)
    query_results = index.query(namespace="legitimateImageDB", vector=[query_embedding.tolist()], top_k=top_k, include_values=True, include_metadata=True)
    return query_results

 
@app.route('/process_image', methods=['POST'])
def process_image():
    data = request.json
    image_url = data.get('url')
 
    if not image_url:
        return jsonify({"error": "URL is required"}), 400
 
    save_path = 'query_image.jpg'

    result = download_image(image_url, save_path)
    if not result:
        # Delay for 8 seconds
        time.sleep(8)
        # Download the image again
        result = download_image(image_url, save_path)
        if not result:
            time.sleep(2)
            result = download_image(image_url, save_path)
    
    if not result:
        return jsonify({"error": "Failed to download image"}), 400
 
    query_results = query_similar_images(save_path, top_k=1)
    if query_results and query_results['matches']:
        closest_match = query_results['matches'][0]
        response_data = {
            "score": closest_match['score'],
            "url": closest_match['metadata'].get('url'),
            "domain": closest_match['metadata'].get('domain')
        }
        return jsonify(response_data), 200
 
    return jsonify({"error": "No similar images found"}), 404
 
if __name__ == '__main__':
    app.run(port=8000, debug=True)