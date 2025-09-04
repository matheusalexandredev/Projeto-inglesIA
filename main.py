from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# OpenAI opcional
try:
    import openai
except ImportError:
    openai = None

# Carregar variáveis do .env
load_dotenv()
API_KEY = os.getenv("OPENAI_API_KEY")
if API_KEY and openai:
    openai.api_key = API_KEY

app = FastAPI()

# Liberar frontend para consumir a API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    message: str

@app.post("/api/ai")
async def chat_with_ai(msg: Message):
    user_message = msg.message.strip()

    # Caso tenha API Key válida
    if API_KEY and openai:
        try:
            response = openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": user_message}],
                temperature=0.7,
                max_tokens=150
            )
            reply = response.choices[0].message.content
            return {"reply": reply}
        except Exception as e:
            print("⚠️ Erro OpenAI, usando modo offline:", e)

    # 🔹 MODO OFFLINE SIMULADO
    if user_message.lower().startswith("traduz"):
        texto = user_message.replace("traduz", "").strip()
        return {"reply": f"(Simulação) Tradução de '{texto}' → '{texto[::-1]}'"}

    if "hello" in user_message.lower():
        return {"reply": "(Simulação) Hi! How are you?"}

    return {"reply": f"(Simulação) Você disse: {user_message}"}
