# CodeClash — Coding Contest Platform

A full-stack 3-round competitive coding contest web app.

## 🗂 Project Structure
```
E:\contest\
├── backend\
│   ├── app\
│   │   ├── main.py          ← FastAPI entry point
│   │   ├── config.py        ← Round rules & language config
│   │   ├── database.py      ← SQLite + SQLAlchemy setup
│   │   ├── models.py        ← DB models (User, Question, Submission)
│   │   ├── schemas.py       ← Pydantic request/response schemas
│   │   ├── executor.py      ← Code runner (Piston API + local fallback)
│   │   ├── seed.py          ← Pre-built contest questions
│   │   └── routers\
│   │       ├── users.py
│   │       ├── questions.py
│   │       ├── submissions.py   ← Round 1/2/3 logic
│   │       └── leaderboard.py
│   └── requirements.txt
└── frontend\
    ├── src\
    │   ├── pages\
    │   │   ├── Register.jsx
    │   │   ├── Login.jsx
    │   │   ├── ContestHub.jsx
    │   │   ├── Round1.jsx      ← Bug Fixing (3 attempts, C/C++)
    │   │   ├── Round2.jsx      ← Guess Output (MCQ, 1 attempt)
    │   │   ├── Round3.jsx      ← Reverse Coding (C/C++/Python)
    │   │   └── Leaderboard.jsx ← Podium + full rankings
    │   ├── contexts\
    │   │   └── UserContext.jsx
    │   ├── api.js
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

## 🚀 How to Run

### 1. Start the Backend (Terminal 1)
```powershell
E:\contest\start_backend.ps1
```
Backend runs at: http://localhost:8000
API Docs (Swagger): http://localhost:8000/docs

### 2. Start the Frontend (Terminal 2)
```powershell
E:\contest\start_frontend.ps1
```
Frontend runs at: http://localhost:5173

## 📋 Contest Rounds

| Round | Format | Languages | Attempts |
|---|---|---|---|
| Round 1: Bug Finding & Fixing | Code Editor | C, C++ | Max 3 |
| Round 2: Guess the Output | MCQ | C, Python | 1 only |
| Round 3: Reverse Coding | Code Editor | C, C++, Python | Unlimited |

## 🏆 Scoring
- **Round 1**: 20 pts/Q (100% → 80% → 60% per attempt)
- **Round 2**: 10 pts/Q (binary: correct/incorrect)
- **Round 3**: Up to 30 pts/Q (proportional to test cases passed)
- **Winner**: Highest total score, tie-broken by least time taken

## ⚙️ Requirements
- Python 3.10+
- Node.js 18+
- Internet connection (for Piston API code runner)
  - Offline fallback uses local gcc/g++/python3 if available
