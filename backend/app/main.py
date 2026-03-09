import io
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from app.services.ai_agent import agente_ia 
from pypdf import PdfReader 

app = FastAPI(title="API del Agente de IA", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "ok", "message": "El motor de IA está en línea."}

@app.post("/api/chat")
async def chat_endpoint(query: str):
    respuesta_ia = agente_ia.consultar(query)
    return {"response": respuesta_ia}

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    # 1. Leemos el archivo físico que envía React
    contenido_bytes = await file.read()
    contenido_texto = ""
    
    try:
        # 2. Verificamos si la extensión del archivo es PDF
        if file.filename.lower().endswith(".pdf"):
            # Usamos BytesIO para leer el PDF directamente desde la memoria RAM del contenedor
            lector_pdf = PdfReader(io.BytesIO(contenido_bytes))
            
            # Extraemos el texto página por página
            for pagina in lector_pdf.pages:
                texto_pagina = pagina.extract_text()
                if texto_pagina:
                    contenido_texto += texto_pagina + "\n"
                    
        # 3. Si no es PDF, asumimos que es un archivo de texto plano (.txt)
        else:
            contenido_texto = contenido_bytes.decode("utf-8")
            
        # 4. Le pasamos el texto extraído a LangChain y FAISS
        resultado = agente_ia.ingestar_documento(contenido_texto)
        
        return {"status": "success", "message": f"Archivo {file.filename} procesado. {resultado}"}
        
    except Exception as e:
        return {"status": "error", "message": f"Fallo al leer el archivo: {str(e)}"}