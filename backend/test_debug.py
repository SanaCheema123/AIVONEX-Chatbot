import os, re, json
from dotenv import load_dotenv
load_dotenv()

print("=== TEST 1: Groq API ===")
from groq import Groq
client = Groq(api_key=os.environ.get("GROQ_API_KEY",""))
r = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    max_tokens=500,
    messages=[
        {"role":"system","content":'Respond ONLY with this JSON: {"resume":"test resume content","coverLetter":"test cover letter","email":"test email content","summary":"test summary"}'},
        {"role":"user","content":"Generate for TechNova"}
    ]
)
raw = r.choices[0].message.content
print("RAW:", raw[:300])

raw2 = re.sub(r"```json","",raw)
raw2 = re.sub(r"```","",raw2).strip()
m = re.search(r"\{[\s\S]*\}", raw2)
if m:
    parsed = json.loads(m.group())
    print("PARSE OK:", list(parsed.keys()))
else:
    print("PARSE FAILED - raw was:", raw2[:200])

print("")
print("=== TEST 2: Document Generator ===")
from document_generator import generate_docx, generate_pdf
os.makedirs("outputs", exist_ok=True)
try:
    generate_docx("## Test\n- item one\n- item two", "outputs/test.docx", "resume", "TechNova")
    print("DOCX OK")
except Exception as e:
    print("DOCX FAILED:", str(e))
try:
    generate_pdf("## Test\n- item one\n- item two", "outputs/test.pdf", "resume", "TechNova")
    print("PDF OK")
except Exception as e:
    print("PDF FAILED:", str(e))
