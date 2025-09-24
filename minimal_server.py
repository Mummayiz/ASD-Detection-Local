from fastapi import FastAPI
import uvicorn
import os

app = FastAPI(title="ASD Detection API - Minimal", version="1.0.0")

@app.get("/health")
async def health_check():
    """Ultra-simple health check"""
    return {"status": "ok"}

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "ASD Detection API is running", "status": "ok"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"🚀 Starting Minimal Server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
