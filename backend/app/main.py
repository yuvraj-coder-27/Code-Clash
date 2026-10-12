from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, SessionLocal
from .models import Base
from .seed import seed_database
from .routers import users, questions, submissions, leaderboard

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CodeClash Contest API", version="1.0.0")

# Allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(users.router)
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
    return {"message": "CodeClash API is running!"}
