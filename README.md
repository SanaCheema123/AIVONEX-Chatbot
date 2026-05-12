## AI — Full-Stack Job Application Assistant##

<img width="1912" height="912" alt="aivonex chatbot" src="https://github.com/user-attachments/assets/500b14b6-7ae5-4e30-985f-b6814ae5b46a" />

Tech Stack: React 18 + Vite (frontend) | FastAPI + Python (backend) | Claude Sonnet (AI) | python-docx + ReportLab (documents)

## Quick Start

### 1. Get Anthropic API Key
Sign up at https://console.anthropic.com

### 2. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
# Edit .env → set ANTHROPIC_API_KEY=sk-...
uvicorn main:app --reload --port 8000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Project Structure
```
jobcraft/
├── backend/
│   ├── main.py                 # FastAPI routes
│   ├── document_generator.py   # DOCX & PDF generation
│   ├── requirements.txt
│   └── .env                    # ← PUT API KEY HERE
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── components/
    │   │   ├── Header.jsx
    │   │   ├── Sidebar.jsx
    │   │   └── ChatArea.jsx
    │   ├── utils/api.js
    │   └── styles/
    ├── index.html
    └── package.json
```

## API Endpoints
- POST /api/upload-resume   — parse resume file
- POST /api/generate        — generate all 3 documents
- POST /api/refine          — refine via chat
- GET  /api/download/{file} — download DOCX or PDF
