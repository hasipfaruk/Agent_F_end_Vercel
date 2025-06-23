# Setting up Chroma DB client and dependencies
import chromadb
import json
import os
from chromadb.utils import embedding_functions
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Initializing FastAPI app
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Choosing embedding function
embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

# Initializing Chroma DB client (persistent storage)
client = chromadb.PersistentClient(path="./chroma_db")

# Creating or getting the collection
collection_name = "elon_musk_knowledge_base"
try:
    collection = client.get_collection(name=collection_name)
    print(f"Collection '{collection_name}' already exists.")
except:
    collection = client.create_collection(
        name=collection_name,
        embedding_function=embedding_function,
        metadata={"hnsw:space": "cosine"}
    )
    print(f"Created collection '{collection_name}'.")

# Loading Prompts.json with UTF-8 encoding
def load_prompts():
    try:
        with open("D:/Digital/Agent_F_end_Vercel-main/client/src/lib/Prompts.json", "r", encoding="utf-8") as file:
            prompts = json.load(file)
        print(f"Loaded {len(prompts)} prompts from Prompts.json")
        return prompts
    except Exception as e:
        print(f"Error loading Prompts.json: {e}")
        return []

# Populating the collection with prompts
def populate_collection():
    prompts = load_prompts()
    if not prompts:
        return
    
    # Preparing documents, IDs, and metadata
    documents = [prompt["question"] for prompt in prompts]
    metadatas = [{"answer": prompt["answer"]} for prompt in prompts]
    ids = [f"prompt_{i}" for i in range(len(prompts))]
    
    # Adding to Chroma DB (only if collection is empty)
    if collection.count() == 0:
        collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
        print(f"Added {len(prompts)} prompts to Chroma DB collection '{collection_name}'.")
    else:
        print(f"Collection '{collection_name}' already contains {collection.count()} documents.")

# Querying the collection
@app.post("/query")
async def query_knowledge_base(query: dict):
    try:
        query_text = query.get("text")
        if not query_text:
            return {"error": "Query text is required"}
        
        results = collection.query(
            query_texts=[query_text],
            n_results=1,
            include=["documents", "metadatas", "distances"]
        )
        
        if results["documents"] and results["documents"][0]:
            top_result = {
                "question": results["documents"][0][0],
                "answer": results["metadatas"][0][0]["answer"],
                "distance": results["distances"][0][0]
            }
            # Only return if similarity is high (distance < 0.4 for cosine)
            if top_result["distance"] < 0.4:
                return top_result
        return {"answer": None}
    except Exception as e:
        print(f"Error querying Chroma DB: {e}")
        return {"error": str(e)}

# Running the population on startup
if __name__ == "__main__":
    populate_collection()
    uvicorn.run(app, host="0.0.0.0", port=8000)