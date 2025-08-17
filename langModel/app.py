from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import fitz  # PyMuPDF
from pinecone import Pinecone
from langchain_huggingface import HuggingFaceEmbeddings
import google.generativeai as genai
import uuid
from pymongo import MongoClient


load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT")
PINECONE_INDEX = os.getenv("PINECONE_INDEX")
MONGO_URI = os.getenv("MONGO_URI")

if not all([GEMINI_API_KEY, PINECONE_API_KEY, PINECONE_ENVIRONMENT, PINECONE_INDEX, MONGO_URI]):
    raise ValueError("Missing API keys or MongoDB URI in .env")

# ------------------ Init services ------------------
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(PINECONE_INDEX)

embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/paraphrase-albert-small-v2")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

mongo_client = MongoClient(MONGO_URI)
db = mongo_client['dsc_chatbot']
chats_col = db['chats']  # stores chat sessions & messages

app = Flask(__name__)
CORS(app)

# ------------------ Helpers ------------------
def extract_text_from_pdf(file):
    pdf_document = fitz.open(stream=file.read(), filetype="pdf")
    text = ""
    for page in pdf_document:
        text += page.get_text()
    return text

def split_text(text, chunk_size=500):
    words = text.split()
    return [" ".join(words[i:i+chunk_size]) for i in range(0, len(words), chunk_size)]

# ------------------ APIs ------------------

# 1️⃣ Create new chat session (train PDF)
@app.route("/train", methods=["POST"])
def train():
    try:
        pdf_file = request.files["file"]
        user_id = request.form.get("user_id")
        chat_name = request.form.get("chat_name") or f"Chat-{uuid.uuid4().hex[:6]}"
        chat_id = str(uuid.uuid4())

        text = extract_text_from_pdf(pdf_file)
        chunks = split_text(text)

        # Generate embeddings and store in Pinecone namespace per chat
        vectors = []
        for i, chunk in enumerate(chunks):
            vector = embedding_model.embed_query(chunk)
            vectors.append({
                "id": f"{chat_id}-{i}",
                "values": vector,
                "metadata": {"text": chunk}
            })
        index.upsert(vectors=vectors, namespace=chat_id)

        # Store chat session in MongoDB
        chat_doc = {
            "_id": chat_id,
            "user_id": user_id,
            "chat_name": chat_name,
            "messages": [],
            "created_at": uuid.uuid1().time  # simple timestamp
        }
        chats_col.insert_one(chat_doc)

        return jsonify({"status": "success", "chatId": chat_id, "chatName": chat_name, "chunks": len(chunks)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 2️⃣ Ask question for a chat session
@app.route("/query", methods=["POST"])
def query():
    try:
        data = request.json
        user_id = data.get("user_id")
        chat_id = data.get("chat_id")
        question = data.get("question")

        if not all([user_id, chat_id, question]):
            return jsonify({"error": "Missing user_id, chat_id, or question"}), 400

        # 1. Query Pinecone embeddings
        query_vector = embedding_model.embed_query(question)
        results = index.query(vector=query_vector, top_k=5, namespace=chat_id, include_metadata=True)

        context = "\n".join([match["metadata"]["text"] for match in results["matches"]])
        if not context.strip():
            answer_text = "No relevant content found."
        else:
            prompt = f"Answer the question based on the context:\n\nContext:\n{context}\n\nQuestion: {question}\nAnswer:"
            response = model.generate_content(prompt)
            answer_text = response.text

        # 2. Save message to MongoDB
        message = {"question": question, "answer": answer_text, "timestamp": str(uuid.uuid1().time)}
        chats_col.update_one({"_id": chat_id}, {"$push": {"messages": message}})

        # print(message)

        return jsonify(message)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 3️⃣ Fetch all chat sessions for a user
@app.route("/chats/<user_id>", methods=["GET"])
def get_chats(user_id):
    try:
        user_chats = list(chats_col.find({"user_id": user_id}, {"messages": 1, "chat_name": 1}))
        # print(user_chats)
        return jsonify(user_chats[::-1])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

from bson import ObjectId

# 4️⃣ Rename chat session
@app.route("/chats/rename", methods=["POST"])
def rename_chat():
    try:
        data = request.json
        chat_id = data.get("chatId")
        new_name = data.get("newName")

        if not all([chat_id, new_name]):
            return jsonify({"error": "Missing chatId or newName"}), 400

        result = chats_col.update_one(
            {"_id": chat_id},  # ✅ match string UUID instead of ObjectId
            {"$set": {"chat_name": new_name}}
        )

        if result.matched_count == 0:
            return jsonify({"error": "Chat not found"}), 404

        return jsonify({"status": "success"})
    except Exception as e:
        import traceback
        print("🔥 Rename error:\n", traceback.format_exc())
        return jsonify({"error": str(e)}), 500



# 5️⃣ Delete chat session
from bson import ObjectId

from bson import ObjectId

@app.route("/chats/delete", methods=["POST"])
def delete_chat():
    try:
        data = request.json
        chat_id = data.get("chatId")
        print("🔎 Received chatId:", chat_id)

        if not chat_id:
            return jsonify({"error": "Missing chatId"}), 400

        result = chats_col.delete_one({"_id": chat_id})
        print("🗑 Delete result:", result.deleted_count)

        if result.deleted_count == 0:
            return jsonify({"error": "Chat not found"}), 404

        return jsonify({"status": "deleted"})
    except Exception as e:
        import traceback
        print("🔥 Delete route error:\n", traceback.format_exc())
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5001)
