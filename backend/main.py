from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import requests
import io

# Optional libraries for PDF/DOCX parsing
import PyPDF2
# import docx

app = FastAPI()

origins = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_API_KEY = "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"
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
HEADERS = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}

def extract_text_from_pdf(file_bytes):
    reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text

@app.post("/chat")
async def chat(message: str = Form(...), file: UploadFile | None = File(None)):
    file_text = ""
    if file:
        contents = await file.read()
        filename = file.filename.lower()

        if filename.endswith(".txt"):
            file_text = contents.decode('utf-8', errors='ignore')

        elif filename.endswith(".pdf"):
            file_text = extract_text_from_pdf(contents)

        # elif filename.endswith(".docx"):
        #     # code for docx extraction here
        #     pass

        else:
            file_text = "[File format not supported for text extraction]"

        # Combine user message with extracted text from file
        full_message = f"{message}\n\nFile Content:\n{file_text}"
    else:
        full_message = message

    if not full_message.strip():
        return {"error": "Message or file content is required"}

    payload = {
        "model": "llama3-70b-8192",
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": full_message}
        ],
        "temperature": 0.7,
    }

    try:
        response = requests.post(GROQ_API_URL, headers=HEADERS, json=payload)
        response.raise_for_status()
        data = response.json()
        reply = data["choices"][0]["message"]["content"]
        return {"reply": reply, "original": full_message}
    except Exception as e:
        return {"error": str(e)}
