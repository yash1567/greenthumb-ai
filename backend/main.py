from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="KrushiMitra API",
    description="FastAPI backend service for KrushiMitra dual-stack application",
    version="1.0.0",
)

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "ok",
        "service": "KrushiMitra API",
        "message": "FastAPI backend is running successfully."
    }

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
