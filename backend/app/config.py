import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./code_clash.db")
PISTON_API_URL = "https://emkc.org/api/v2/piston/execute"

ROUND_CONFIG = {
    1: {
        "name": "Bug Finding & Fixing",
        "description": "Identify and fix errors in C/C++ code. Max 3 attempts per question.",
        "max_attempts": 3,
        "languages": ["c", "cpp"],
        "points": 20,
    },
    2: {
        "name": "Guess the Output",
        "description": "Predict the output of tricky code snippets (Python & C). 1 attempt per question.",
        "max_attempts": 1,
        "languages": ["python", "c"],
        "points": 10,
    },
    3: {
        "name": "Reverse Coding",
        "description": "Deduce the logic from inputs/outputs, then write code to reproduce the result.",
        "max_attempts": 999,
        "languages": ["c", "cpp", "python"],
        "points": 30,
    },
}

LANGUAGE_MAP = {
    "c":      {"language": "c",      "version": "10.2.0"},
    "cpp":    {"language": "c++",    "version": "10.2.0"},
    "python": {"language": "python", "version": "3.10.0"},
}
