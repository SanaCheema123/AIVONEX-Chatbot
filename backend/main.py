import os, uuid, re, json
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq
from document_generator import generate_docx, generate_pdf

load_dotenv()

app = FastAPI(title="SanaDask", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://localhost:3000","http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.environ.get("GROQ_API_KEY",""))
OUTPUT_DIR = Path("outputs")
OUTPUT_DIR.mkdir(exist_ok=True)


class GenerateRequest(BaseModel):
    company_name: str
    job_description: str
    github_url: Optional[str] = ""
    scholar_url: Optional[str] = ""
    company_notes: Optional[str] = ""
    resume_text: Optional[str] = ""

class RefineRequest(BaseModel):
    message: str
    current_resume: str
    current_cover_letter: str
    current_email: str
    company_name: str
    job_description: str
    conversation_history: list


def extract_text(content: bytes, ext: str) -> str:
    if ext in [".txt", ".md"]:
        return content.decode("utf-8", errors="ignore")
    if ext == ".pdf":
        import PyPDF2, io
        reader = PyPDF2.PdfReader(io.BytesIO(content))
        return "\n".join(p.extract_text() or "" for p in reader.pages)
    if ext in [".docx", ".doc"]:
        import docx as _d, io
        return "\n".join(p.text for p in _d.Document(io.BytesIO(content)).paragraphs)
    raise HTTPException(400, "Unsupported file type. Use PDF, DOCX or TXT.")


def parse_json(raw: str) -> dict:
    raw = re.sub(r"```json", "", raw)
    raw = re.sub(r"```", "", raw)
    raw = raw.strip()
    m = re.search(r"\{[\s\S]*\}", raw)
    if m:
        return json.loads(m.group())
    raise ValueError("No JSON in response")


def safe_name(n: str) -> str:
    return re.sub(r"[^a-zA-Z0-9_\-]", "_", n)


def call_groq(system: str, messages: list, max_tokens: int = 4000) -> str:
    all_messages = [{"role": "system", "content": system}] + messages
    r = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=max_tokens,
        messages=all_messages,
    )
    return r.choices[0].message.content


def make_files(content: str, base: str, doc_type: str, company: str) -> dict:
    docx_path = str(OUTPUT_DIR / (base + ".docx"))
    pdf_path  = str(OUTPUT_DIR / (base + ".pdf"))
    generate_docx(content, docx_path, doc_type, company)
    generate_pdf(content,  pdf_path,  doc_type, company)
    return {
        "docx": "/api/download/" + base + ".docx",
        "pdf":  "/api/download/" + base + ".pdf",
    }


SYSTEM = """You are a professional career coach and writer.
Generate THREE tailored job application documents.

Respond ONLY with valid JSON - no markdown, no backticks, no extra text:
{"resume":"...","coverLetter":"...","email":"...","summary":"..."}

RESUME: sections SUMMARY, SKILLS, EXPERIENCE, PROJECTS, EDUCATION. Use ## for headers, ### for job titles, - for bullets. Match keywords from job description.
COVER LETTER: 3 paragraphs, 300-400 words. Why company, skill matches, CTA.
EMAIL: Subject line first, 3 short paragraphs, under 200 words.
SUMMARY: 2 sentences describing what was tailored."""


def build_message(req: GenerateRequest) -> str:
    parts = [
        "COMPANY: " + req.company_name,
        "JOB DESCRIPTION:\n" + req.job_description,
    ]
    if req.resume_text:
        parts.append("CANDIDATE RESUME:\n" + req.resume_text[:6000])
    else:
        parts.append("No resume provided - create strong generic profile.")
    if req.github_url:
        parts.append("GitHub: " + req.github_url)
    if req.scholar_url:
        parts.append("Google Scholar: " + req.scholar_url)
    if req.company_notes:
        parts.append("Company notes: " + req.company_notes)
    return "\n\n".join(parts)


@app.get("/")
def root():
    return {"status": "SanaDask running", "version": "2.0.0"}


@app.post("/api/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    try:
        content = await file.read()
        ext = Path(file.filename).suffix.lower()
        text = extract_text(content, ext)
        return {"text": text[:8000], "filename": file.filename, "chars": len(text)}
    except Exception as e:
        raise HTTPException(500, "Upload failed: " + str(e))


@app.post("/api/generate")
async def generate(req: GenerateRequest):
    try:
        if not req.job_description.strip():
            raise HTTPException(400, "Job description is required.")
        if not req.company_name.strip():
            raise HTTPException(400, "Company name is required.")

        user_msg = build_message(req)
        raw = call_groq(SYSTEM, [{"role": "user", "content": user_msg}])
        parsed = parse_json(raw)

        session = str(uuid.uuid4())[:8]
        company = safe_name(req.company_name)
        files = {}

        for key, label in [("resume","resume"),("coverLetter","cover_letter"),("email","email")]:
            text = parsed.get(key, "")
            if text:
                base = label + "_" + company + "_" + session
                files[key] = make_files(text, base, key, req.company_name)

        return {
            "resume":       parsed.get("resume", ""),
            "coverLetter":  parsed.get("coverLetter", ""),
            "email":        parsed.get("email", ""),
            "summary":      parsed.get("summary", "Documents generated successfully."),
            "files":        files,
            "conversation": [
                {"role": "user",      "content": user_msg},
                {"role": "assistant", "content": raw},
            ],
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(500, "Generation failed: " + str(e))


@app.post("/api/refine")
async def refine(req: RefineRequest):
    try:
        system = (
            "You are a professional career coach. Refine these documents.\n\n"
            "RESUME:\n" + req.current_resume[:2000] + "\n\n"
            "COVER LETTER:\n" + req.current_cover_letter[:1500] + "\n\n"
            "EMAIL:\n" + req.current_email[:600] + "\n\n"
            'If modifying documents respond with JSON only: {"resume":"...","coverLetter":"...","email":"...","summary":"...","changed":["resume"]}\n'
            "If answering a question respond with plain text."
        )

        history = req.conversation_history[-6:]
        history.append({"role": "user", "content": req.message})
        raw = call_groq(system, history)

        try:
            parsed = parse_json(raw)
            if any(k in parsed for k in ["resume","coverLetter","email"]):
                session = str(uuid.uuid4())[:8]
                company = safe_name(req.company_name)
                files = {}
                changed = parsed.get("changed", list(parsed.keys()))
                for key, label in [("resume","resume"),("coverLetter","cover_letter"),("email","email")]:
                    text = parsed.get(key, "")
                    if text and key in changed:
                        base = label + "_" + company + "_" + session
                        files[key] = make_files(text, base, key, req.company_name)
                return {
                    "type":        "update",
                    "resume":      parsed.get("resume",      req.current_resume),
                    "coverLetter": parsed.get("coverLetter", req.current_cover_letter),
                    "email":       parsed.get("email",       req.current_email),
                    "summary":     parsed.get("summary",     "Documents updated."),
                    "changed":     changed,
                    "files":       files,
                    "message":     raw,
                }
        except Exception:
            pass

        return {"type": "message", "message": raw}

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(500, "Refine failed: " + str(e))


@app.get("/api/download/{filename}")
async def download(filename: str):
    filename = Path(filename).name
    path = OUTPUT_DIR / filename
    if not path.exists():
        raise HTTPException(404, "File not found.")
    media = (
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        if filename.endswith(".docx") else "application/pdf"
    )
    return FileResponse(path, media_type=media, filename=filename)


