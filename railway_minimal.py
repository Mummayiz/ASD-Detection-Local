from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn
import os

app = FastAPI()

# Serve static files from frontend build
try:
    app.mount("/static", StaticFiles(directory="frontend/build/static"), name="static")
except Exception as e:
    print(f"Could not mount static files: {e}")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/")
def root():
    """Serve the React frontend"""
    try:
        return FileResponse('frontend/build/index.html')
    except Exception as e:
        return {"message": "ASD Detection API - Railway Ready", "error": str(e)}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
