# ============================================
# MediScan AI — FastAPI Application Entry Point
# ============================================
# Run with:  uvicorn app.main:app --reload
# Docs at:   http://localhost:8000/docs
# ============================================

import logging
import traceback

import os
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from app.database import engine, Base

# Import all models so SQLAlchemy knows about them
from app.models import User, Prescription, Medicine, Order, MedicineMaster  # noqa: F401

# Import route modules
from app.routes import auth, users, prescriptions, orders, pharmacy, dashboard, medicines

load_dotenv()

# ── Create FastAPI app ─────────────────────
app = FastAPI(
    title="MediScan AI — Smart Prescription Scanner",
    description="Backend API for MediScan AI. Handles auth, prescription OCR processing, priority classification, and order management.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS Middleware ────────────────────────
# Allows the React frontend (default: localhost:5173) to call these APIs
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        frontend_url,
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Create database tables ─────────────────
# This creates all tables on startup if they don't exist
Base.metadata.create_all(bind=engine)

# ── Mount static files for uploads ─────────
upload_dir = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

# ── Register all API routes under /api ─────
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(prescriptions.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(pharmacy.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(medicines.router, prefix="/api")

# ── Global exception handler for debugging ─
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    tb = traceback.format_exc()
    logger.error(f"Unhandled error on {request.url}: {exc}\n{tb}")
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "traceback": tb},
    )


# ── Root endpoint ──────────────────────────
@app.get("/")
def root():
    return {
        "message": "🏥 MediScan AI Backend is running!",
        "docs": "/docs",
        "version": "1.0.0",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


