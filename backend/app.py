import os
import re
import requests
import asyncio
from datetime import datetime
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from io import BytesIO

from model import PythonClassifier
from generator import generate_local_content
from auth import (
    PUBLIC_REGISTRATION_ROLES,
    ROLES,
    User,
    can_assign_role,
    create_access_token,
    get_current_user,
    get_db,
    hash_password,
    init_auth_database,
    is_only_active_super_admin,
    is_last_super_admin,
    require_roles,
    user_payload,
    verify_password,
)
from sqlalchemy.orm import Session

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
    init_auth_database()
    asyncio.create_task(train_classifier_in_background())


async def train_classifier_in_background():
    """Keep the HTTP service available while the local model is training."""
    global train_stats_data
    print("[BACKEND] Entrenando la red neuronal en el arranque...")
    train_stats_data = await asyncio.to_thread(classifier.train)
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


class StudyExplainRequest(BaseModel):
    text: str = Field(min_length=1, max_length=120_000)


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=128)
    role: str = "estudiante"


class LoginRequest(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=1, max_length=128)


class PasswordChangeRequest(BaseModel):
    current_password: str = Field(alias="currentPassword", min_length=1, max_length=128)
    new_password: str = Field(alias="newPassword", min_length=8, max_length=128)


class PasswordResetRequest(BaseModel):
    new_password: str = Field(alias="newPassword", min_length=8, max_length=128)


class RoleUpdateRequest(BaseModel):
    role: str


class StatusUpdateRequest(BaseModel):
    is_active: bool = Field(alias="isActive")


class UserCreateRequest(RegisterRequest):
    pass


def normalized_email(email: str) -> str:
    email = email.strip().lower()
    if "@" not in email or email.startswith("@") or email.endswith("@"):
        raise HTTPException(status_code=422, detail="Ingresa un correo electrónico válido.")
    return email


def auth_response(user: User) -> Dict[str, Any]:
    return {"accessToken": create_access_token(user), "tokenType": "bearer", "user": user_payload(user)}


@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
def register_user(req: RegisterRequest, db: Session = Depends(get_db)):
    """Public registration is deliberately limited to learner and teacher roles."""
    role = req.role.strip().lower()
    if role not in PUBLIC_REGISTRATION_ROLES:
        raise HTTPException(status_code=403, detail="Los roles administrativos solo pueden ser asignados por un super administrador.")
    email = normalized_email(req.email)
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail="Ya existe una cuenta con este correo.")
    user = User(name=req.name.strip(), email=email, password_hash=hash_password(req.password), role=role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return auth_response(user)


@app.post("/api/auth/login")
def login_user(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == normalized_email(req.email)).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Correo o contraseña incorrectos.")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Esta cuenta está desactivada.")
    return auth_response(user)


@app.get("/api/auth/me")
def current_session(user: User = Depends(get_current_user)):
    return {"user": user_payload(user)}


@app.post("/api/auth/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_own_password(
    req: PasswordChangeRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(req.current_password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="La contraseña actual no es correcta.")
    if verify_password(req.new_password, user.password_hash):
        raise HTTPException(status_code=422, detail="La nueva contraseña debe ser diferente de la actual.")
    user.password_hash = hash_password(req.new_password)
    db.commit()


@app.get("/api/admin/users")
def list_users(
    _: User = Depends(require_roles("super_admin", "admin")),
    db: Session = Depends(get_db),
):
    return {"users": [user_payload(user) for user in db.query(User).order_by(User.created_at.desc()).all()]}


@app.post("/api/admin/users", status_code=status.HTTP_201_CREATED)
def create_user(
    req: UserCreateRequest,
    actor: User = Depends(require_roles("super_admin", "admin")),
    db: Session = Depends(get_db),
):
    role = req.role.strip().lower()
    if not can_assign_role(actor, role):
        raise HTTPException(status_code=403, detail="No puedes crear usuarios con ese rol.")
    email = normalized_email(req.email)
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail="Ya existe una cuenta con este correo.")
    user = User(name=req.name.strip(), email=email, password_hash=hash_password(req.password), role=role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"user": user_payload(user)}


@app.patch("/api/admin/users/{user_id}/role")
def update_user_role(
    user_id: int,
    req: RoleUpdateRequest,
    actor: User = Depends(require_roles("super_admin", "admin")),
    db: Session = Depends(get_db),
):
    role = req.role.strip().lower()
    if not can_assign_role(actor, role):
        raise HTTPException(status_code=403, detail="No puedes asignar ese rol.")
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    if is_last_super_admin(db, user, role):
        raise HTTPException(status_code=422, detail="Debe permanecer al menos un super administrador activo.")
    user.role = role
    db.commit()
    db.refresh(user)
    return {"user": user_payload(user)}


@app.patch("/api/admin/users/{user_id}/status")
def update_user_status(
    user_id: int,
    req: StatusUpdateRequest,
    actor: User = Depends(require_roles("super_admin")),
    db: Session = Depends(get_db),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    if user.id == actor.id and not req.is_active:
        raise HTTPException(status_code=422, detail="No puedes banear tu propia cuenta.")
    if not req.is_active and is_only_active_super_admin(db, user):
        raise HTTPException(status_code=422, detail="Debe permanecer al menos un super administrador activo.")
    user.is_active = req.is_active
    db.commit()
    db.refresh(user)
    return {"user": user_payload(user)}


@app.delete("/api/admin/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    actor: User = Depends(require_roles("super_admin")),
    db: Session = Depends(get_db),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    if user.id == actor.id:
        raise HTTPException(status_code=422, detail="No puedes eliminar tu propia cuenta.")
    if is_only_active_super_admin(db, user):
        raise HTTPException(status_code=422, detail="No puedes eliminar al último super administrador activo.")
    db.delete(user)
    db.commit()


@app.post("/api/admin/users/{user_id}/reset-password", status_code=status.HTTP_204_NO_CONTENT)
def reset_user_password(
    user_id: int,
    req: PasswordResetRequest,
    _: User = Depends(require_roles("super_admin")),
    db: Session = Depends(get_db),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    user.password_hash = hash_password(req.new_password)
    db.commit()


def explain_study_extract(text: str) -> str:
    """Produce a short, source-grounded explanation without adding facts."""
    normalized = re.sub(r"\s+", " ", text).strip()
    sentences = [sentence.strip() for sentence in re.findall(r"[^.!?]+[.!?]+", normalized) if len(sentence.strip()) > 24]
    if not sentences:
        return "El extracto no contiene suficientes oraciones completas para elaborar una explicación fiel."
    selected = sentences[:4]
    return "Explicación basada exclusivamente en el extracto cargado: " + " ".join(selected)


def extract_study_text(filename: str, content: bytes) -> str:
    """Extract text locally from a study document without sending it to a model."""
    suffix = os.path.splitext(filename.lower())[1]
    if suffix in {".txt", ".md", ".csv", ".json"}:
        return content.decode("utf-8", errors="replace")
    if suffix == ".pdf":
        try:
            from pypdf import PdfReader
            return "\n".join(page.extract_text() or "" for page in PdfReader(BytesIO(content)).pages)
        except Exception as exc:
            raise HTTPException(status_code=422, detail=f"No se pudo leer el PDF: {exc}") from exc
    if suffix == ".docx":
        try:
            from docx import Document
            document = Document(BytesIO(content))
            return "\n".join(paragraph.text for paragraph in document.paragraphs if paragraph.text.strip())
        except Exception as exc:
            raise HTTPException(status_code=422, detail=f"No se pudo leer el DOCX: {exc}") from exc
    if suffix in {".xlsx", ".xls"}:
        try:
            sheets = __import__("pandas").read_excel(BytesIO(content), sheet_name=None)
            return "\n".join(f"[{name}]\n{sheet.to_csv(index=False)}" for name, sheet in sheets.items())
        except Exception as exc:
            raise HTTPException(status_code=422, detail=f"No se pudo leer la hoja de cálculo: {exc}") from exc
    raise HTTPException(status_code=415, detail="Formato no compatible para extracción de texto.")


@app.post("/api/study/extract")
async def extract_study_document(file: UploadFile = File(...), _: User = Depends(get_current_user)):
    """Return local extracted text for source-grounded study features."""
    content = await file.read()
    if len(content) > 20 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="El archivo supera el límite de 20 MB.")
    filename = file.filename or "documento"
    text = extract_study_text(filename, content).strip()
    if not text:
        raise HTTPException(status_code=422, detail="No se encontró texto extraíble en el archivo.")
    return {"filename": filename, "text": text[:120_000], "truncated": len(text) > 120_000}


@app.post("/api/study/explain")
def explain_study(req: StudyExplainRequest, _: User = Depends(get_current_user)):
    """Explain only what is present in the selected study extract."""
    return {"content": explain_study_extract(req.text)}

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
