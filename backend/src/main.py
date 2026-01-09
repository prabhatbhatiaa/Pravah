from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.services.api import router
from src.services.data_loader import load_initial_data

app = FastAPI(title="Delhi Water-Logging Risk System")

# 1. CORS Configuration (Connects Frontend to Backend)
# allowing all origins for hackathon simplicity
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Register API Routes
app.include_router(router, prefix="/api")

# 3. Startup Event
@app.on_event("startup")
def startup_event():
    print("🚀 System Booting...")
    # This triggers the CSV loading and initial risk calculation
    data = load_initial_data()
    print(f"✅ Loaded {len(data)} Wards into Memory from CSVs.")

@app.get("/")
def root():
    return {"message": "System Online. Visit /docs for API documentation."}

if __name__ == "__main__":
    import uvicorn
    # Runs the server on localhost:8000
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)