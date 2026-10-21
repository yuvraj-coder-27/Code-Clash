from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from .database import engine, SessionLocal
from .models import Base
from .seed import seed_database
from .routers import users as teams_router, questions, submissions, leaderboard

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CodeClash Team Contest API", version="2.0.0")

# Compress responses > 1 KB
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Allow all origins (localhost dev + Vercel + LAN)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(teams_router.router)
app.include_router(questions.router)
app.include_router(submissions.router)
app.include_router(leaderboard.router)


@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "CodeClash Team Contest API is running!"}
