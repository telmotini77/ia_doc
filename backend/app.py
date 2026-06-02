import os
import requests
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

from model import PythonClassifier
from generator import generate_local_content

app = FastAPI(title="DocuGenius Neural Engine API", version="1.0")

# Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global classifier instance
classifier = PythonClassifier()
train_stats_data = {}

@app.on_event("startup")
async def startup_event():
    global train_stats_data
    print("[BACKEND] Entrenando la red neuronal en el arranque...")
    train_stats_data = classifier.train()
    print("[BACKEND] Red neuronal entrenada con éxito.")

def fetch_wikipedia_summary(query: str) -> List[Dict[str, str]]:
    try:
        search_url = f"https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch={query}&utf8=&format=json&origin=*"
        headers = {"User-Agent": "DocuGenius/1.0 (contact@docgenius.org)"}
        r = requests.get(search_url, headers=headers, timeout=6)
        if r.status_code != 200:
            return []
        data = r.json()
        search_results = data.get("query", {}).get("search", [])
        
        pages_info = []
        for i in range(min(len(search_results), 3)):
            page_title = search_results[i]["title"]
            extract_url = f"https://es.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&titles={page_title}&format=json&origin=*"
            er = requests.get(extract_url, headers=headers, timeout=6)
            if er.status_code == 200:
                edata = er.json()
                pages = edata.get("query", {}).get("pages", {})
                for page_id, page_data in pages.items():
                    if page_id != "-1" and "extract" in page_data:
                        pages_info.append({
                            "title": page_title,
                            "extract": page_data["extract"]
                        })
        return pages_info
    except Exception as e:
        print(f"[BACKEND] Error buscando en Wikipedia: {e}")
        return []

def fetch_scientific_papers(query: str) -> List[Dict[str, Any]]:
    try:
        url = f"https://api.openalex.org/works?search={query}&per_page=5"
        headers = {"User-Agent": "DocuGenius/1.0 (contact@docgenius.org)"}
        r = requests.get(url, headers=headers, timeout=6)
        if r.status_code != 200:
            return []
        data = r.json()
        results = data.get("results", [])
        
        papers = []
        for work in results:
            authors_str = "Autor Desconocido"
            authorships = work.get("authorships", [])
            if authorships:
                author_names = [a.get("author", {}).get("display_name", "") for a in authorships[:3] if a.get("author", {}).get("display_name")]
                author_names = [name for name in author_names if name]
                if len(authorships) > 3:
                    authors_str = f"{', '.join(author_names)} et al."
                elif len(author_names) == 2:
                    authors_str = f"{author_names[0]} y {author_names[1]}"
                elif author_names:
                    authors_str = ", ".join(author_names)
            
            source_name = work.get("primary_location", {}).get("source", {}).get("display_name") or "Journal or Conference proceedings"
            abstract = ""
            abstract_inverted = work.get("abstract_inverted_index")
            if abstract_inverted:
                try:
                    positions = {}
                    for word, idxs in abstract_inverted.items():
                        for idx in idxs:
                            positions[idx] = word
                    sorted_words = [positions[k] for k in sorted(positions.keys())]
                    abstract = " ".join(sorted_words)
                except Exception:
                    abstract = ""
            
            papers.append({
                "title": work.get("title") or "Artículo Científico sin Título",
                "authors": authors_str,
                "year": work.get("publication_year") or datetime.now().year,
                "venue": source_name,
                "doi": work.get("doi") or f"https://openalex.org/{work.get('id', '').split('/')[-1]}",
                "abstract": abstract
            })
        return papers
    except Exception as e:
        print(f"[BACKEND] Error buscando en OpenAlex: {e}")
        return []

class PredictRequest(BaseModel):
    prompt: str

class GenerateRequest(BaseModel):
    prompt: str
    doc_type: str = Field(alias="docType")
    prediction_result: Optional[Dict[str, Any]] = Field(default=None, alias="predictionResult")
    report_type: Optional[str] = Field(default="tecnico", alias="reportType")
    existing_doc: Optional[Dict[str, Any]] = Field(default=None, alias="existingDoc")
    presentation_style: Optional[str] = Field(default="informe", alias="presentationStyle")
    scientific_papers: Optional[List[Dict[str, Any]]] = Field(default=None, alias="scientificPapers")
    wikipedia_data: Optional[List[Dict[str, Any]]] = Field(default=None, alias="wikipediaData")
    scientific_search: Optional[bool] = Field(default=True, alias="scientificSearch")

    class Config:
        populate_by_name = True

@app.get("/api/train_stats")
def get_train_stats():
    global train_stats_data
    if not train_stats_data:
        train_stats_data = classifier.train()
    return train_stats_data

@app.post("/api/predict")
def predict_prompt(req: PredictRequest):
    if not req.prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
    return classifier.predict(req.prompt)

@app.post("/api/generate")
def generate_document(req: GenerateRequest):
    if not req.prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
    
    # 1. Obtain classification prediction if not provided
    pred = req.prediction_result
    if not pred:
        pred = classifier.predict(req.prompt)
        
    # 2. Run internet research if enabled and needed
    papers = req.scientific_papers
    wiki_data = req.wikipedia_data
    
    if req.scientific_search and req.doc_type in ["report", "presentation", "spreadsheet"]:
        if not papers:
            print(f"[BACKEND] Investigando '{req.prompt}' en OpenAlex...")
            papers = fetch_scientific_papers(req.prompt)
        if not wiki_data:
            print(f"[BACKEND] Investigando '{req.prompt}' en Wikipedia...")
            wiki_data = fetch_wikipedia_summary(req.prompt)
            
    # 3. Generate content structured using generator.py
    data = generate_local_content(
        prompt=req.prompt,
        type_str=req.doc_type,
        prediction_result=pred,
        report_type=req.report_type or "tecnico",
        existing_doc=req.existing_doc,
        presentation_style=req.presentation_style or "informe",
        scientific_papers=papers,
        wikipedia_data=wiki_data
    )
    
    return data
