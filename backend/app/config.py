import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./code_clash.db")
PISTON_API_URL = "https://emkc.org/api/v2/piston/execute"

ROUND_CONFIG = {
    1: {
        "name": "C & C++ Master",
        "description": "5 MCQs + 5 Debugging questions in C and C++.",
        "badge": "C / C++",
        "topic": "c_cpp",
        "languages": ["c", "cpp"],
    },
    2: {
        "name": "Python Proficiency",
        "description": "5 MCQs + 5 Debugging questions in Python.",
        "badge": "Python",
        "topic": "python",
        "languages": ["python"],
    },
    3: {
        "name": "Data Structures & Algorithms",
        "description": "5 MCQs + 5 Debugging problems on core DSA & logic.",
        "badge": "DSA & Logic",
        "topic": "dsa",
        "languages": ["c", "cpp", "python"],
    },
}

LANGUAGE_MAP = {
    "c":      {"language": "c",      "version": "10.2.0"},
    "cpp":    {"language": "c++",    "version": "10.2.0"},
    "python": {"language": "python", "version": "3.10.0"},
}
