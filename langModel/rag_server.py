from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import PyPDF2
import faiss
import numpy as np
import fitz  # PyMuPDF

from sentence_transformers import SentenceTransformer

app = Flask(__name__)
user_indices = {}
user_texts = {}



CORS(app)

UPLOAD_FOLDER = 'uploaded_docs'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load model
model = SentenceTransformer("all-MiniLM-L6-v2")

# FAISS setup
dimension = 384
index = faiss.IndexFlatL2(dimension)
texts = []

def clean_and_split_text(raw_text):
    lines = raw_text.split("\n")
    cleaned = " ".join(line.strip() for line in lines if line.strip())
    sentences = [s.strip() for s in cleaned.split(".") if len(s.strip()) > 10]
    return sentences

def remove_repeated_sentences(sentences):
    seen = set()
    result = []
    for sentence in sentences:
        if sentence not in seen:
            seen.add(sentence)
            result.append(sentence)
    return result



@app.route('/train', methods=['POST'])
def train():
    try:
        file = request.files['file']
        user_id = request.form.get('user_id')

        if not user_id:
            return jsonify({'error': 'Missing user_id'}), 400

        # Save uploaded file temporarily
        filepath = f'temp_{user_id}.pdf'
        file.save(filepath)

        # Extract text from PDF
        doc = fitz.open(filepath)
        full_text = ''
        for page in doc:
            full_text += page.get_text()
        doc.close()
        os.remove(filepath)

        # Split text into chunks
        chunks = [full_text[i:i+500] for i in range(0, len(full_text), 500)]

        # Embed chunks
        embeddings = model.encode(chunks)

        # Create FAISS index
        dimension = embeddings.shape[1]
        index = faiss.IndexFlatL2(dimension)
        index.add(embeddings)

        # Save index for this user
        user_indices[user_id] = {
            'index': index,
            'chunks': chunks
        }

        return jsonify({'message': 'Training complete'})
    except Exception as e:
        print('❌ Error in /train:', e)
        return jsonify({'error': str(e)}), 500


@app.route('/query', methods=['POST'])
def query():
    try:
        data = request.get_json()
        question = data['question']
        user_id = data['user_id']

        if user_id not in user_indices:
            return jsonify({'error': 'User index not found. Upload a PDF first.'}), 400

        index_data = user_indices[user_id]
        index = index_data['index']
        chunks = index_data['chunks']

        # Embed question
        question_embedding = model.encode([question])
        D, I = index.search(question_embedding, k=1)

        best_chunk = chunks[I[0][0]]
        return jsonify({'answer': best_chunk})
    except Exception as e:
        print('❌ Error in /query:', e)
        return jsonify({'error': str(e)}), 500



if __name__ == "__main__":
    app.run(port=5001)

