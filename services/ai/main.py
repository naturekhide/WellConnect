import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.analyze import router as analyze_router
from routes.health import router as health_router

app = FastAPI(
    title="WellConnect AI",
    description="Privacy-first emotional intelligence for WellConnect",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(analyze_router)


@app.get("/")
def root():
    return {
        "service": "WellConnect AI",
        "status": "operational",
        "privacy": "No data stored. All analysis is stateless and ephemeral.",
    }