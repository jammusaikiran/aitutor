from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os, uuid
import fitz  # PyMuPDF
from pinecone import Pinecone
import google.generativeai as genai
from pymongo import MongoClient
from datetime import datetime

# ------------------ Load env ------------------
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX = os.getenv("PINECONE_INDEX")
MONGO_URI = os.getenv("MONGO_URI")

if not all([GEMINI_API_KEY, PINECONE_API_KEY, PINECONE_INDEX, MONGO_URI]):
    raise ValueError("Missing API keys or MongoDB URI in .env")

# ------------------ Init services ------------------
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(PINECONE_INDEX)

genai.configure(api_key=GEMINI_API_KEY)
chat_model = genai.GenerativeModel("gemini-1.5-flash")

mongo_client = MongoClient(MONGO_URI)
db = mongo_client['dsc_chatbot']
chats_col = db['chats']

app = Flask(__name__)
CORS(
    app,
    resources={r"/*": {"origins": [
        " http://localhost:5173",
        "https://chattutorai.netlify.app"
    ]}}
)

# ------------------ Helpers ------------------
def extract_chunks_from_pdf(file, chunk_size=500):
    pdf_document = fitz.open(stream=file.read(), filetype="pdf")
    for page in pdf_document:
        words = page.get_text().split()
        for i in range(0, len(words), chunk_size):
            yield " ".join(words[i:i+chunk_size])

def get_embedding(text: str):
    """Generate embeddings using Gemini embedding API"""
    resp = genai.embed_content(
        model="models/embedding-001",
        content=text,
    )
    return resp['embedding']  # list[float]

# ------------------ APIs ------------------
@app.route("/train", methods=["POST"])
def train():
    try:
        pdf_file = request.files["file"]
        user_id = request.form.get("user_id")
        chat_name = request.form.get("chat_name") or f"Chat-{uuid.uuid4().hex[:6]}"
        chat_id = str(uuid.uuid4())

        chunks = list(extract_chunks_from_pdf(pdf_file))

        # embeddings → Pinecone
        vectors = []
        for i, chunk in enumerate(chunks):
            vector = get_embedding(chunk)
            vectors.append({
                "id": f"{chat_id}-{i}",
                "values": vector,
                "metadata": {"text": chunk}
            })
        index.upsert(vectors=vectors, namespace=chat_id)

        chats_col.insert_one({
            "_id": chat_id,
            "user_id": user_id,
            "chat_name": chat_name,
            "messages": [],
            "created_at": datetime.utcnow()
        })

        return jsonify({"status": "success", "chatId": chat_id, "chatName": chat_name, "chunks": len(chunks)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/query", methods=["POST"])
def query():
    try:
        data = request.json
        user_id, chat_id, question = data.get("user_id"), data.get("chat_id"), data.get("question")
        if not all([user_id, chat_id, question]):
            return jsonify({"error": "Missing params"}), 400

        query_vector = get_embedding(question)
        results = index.query(vector=query_vector, top_k=3, namespace=chat_id, include_metadata=True)

        context = "\n".join([m["metadata"]["text"][:300] for m in results.get("matches", [])])
        if not context.strip():
            answer_text = "No relevant content found."
        else:
            response = chat_model.generate_content(
                f"Answer the question based only on the context:\n{context}\n\nQ: {question}\nA:"
            )
            answer_text = response.text

        message = {"question": question, "answer": answer_text, "timestamp": datetime.utcnow()}
        chats_col.update_one({"_id": chat_id}, {"$push": {"messages": message}})

        return jsonify(message)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/chats/<user_id>", methods=["GET"])
def get_chats(user_id):
    try:
        user_chats = list(chats_col.find({"user_id": user_id}, {"messages": 1, "chat_name": 1}))
        return jsonify(user_chats[::-1])
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/chats/rename", methods=["POST"])
def rename_chat():
    try:
        data = request.json
        chat_id, new_name = data.get("chatId"), data.get("newName")
        if not all([chat_id, new_name]):
            return jsonify({"error": "Missing chatId or newName"}), 400

        result = chats_col.update_one({"_id": chat_id}, {"$set": {"chat_name": new_name}})
        if result.matched_count == 0:
            return jsonify({"error": "Chat not found"}), 404

        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/chats/delete", methods=["POST"])
def delete_chat():
    try:
        data = request.json
        chat_id = data.get("chatId")
        if not chat_id:
            return jsonify({"error": "Missing chatId"}), 400

        result = chats_col.delete_one({"_id": chat_id})
        if result.deleted_count == 0:
            return jsonify({"error": "Chat not found"}), 404

        return jsonify({"status": "deleted"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/welcome",methods=["GET"])
def welcome():
    return jsonify({"name":"flask"})


if __name__ == "__main__":
    app.run(debug=True, port=5001)
