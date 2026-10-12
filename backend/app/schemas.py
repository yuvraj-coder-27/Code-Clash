from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime


# ─── Auth / User ──────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    name: str
    email: str
    roll_no: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    roll_no: str
    role: str

    class Config:
        from_attributes = True


# ─── Questions ────────────────────────────────────────────────────────────────

class TestCaseIn(BaseModel):
    input: str = ""
    expected_output: str
    is_hidden: bool = False

class QuestionCreate(BaseModel):
    round: int
    order: int = 1
    title: str
    description: str
    language: str
    code_template: Optional[str] = None
    mcq_options: Optional[List[str]] = None
    correct_option_index: Optional[int] = None
    test_cases: Optional[List[dict]] = None
    points: int = 10

class QuestionOut(BaseModel):
    id: int
    round: int
    order: int
    title: str
    description: str
    language: str
    code_template: Optional[str]
    mcq_options: Optional[List[str]]
    test_cases: Optional[List[dict]]
    points: int

    class Config:
        from_attributes = True


# ─── Submissions ──────────────────────────────────────────────────────────────

class SubmitBugFix(BaseModel):
    user_id: int
    question_id: int
    code: str
    language: str  # "c" or "cpp"

class SubmitMCQ(BaseModel):
    user_id: int
    question_id: int
    selected_option: int  # 0-based index

class SubmitReverse(BaseModel):
    user_id: int
    question_id: int
    code: str
    language: str  # "c", "cpp", or "python"


class SubmissionOut(BaseModel):
    id: int
    user_id: int
    question_id: int
    round: int
    is_correct: bool
    attempts_used: int
    marks_awarded: float
    test_results: Optional[List[Any]]
    execution_output: Optional[str]
    submitted_at: datetime

    class Config:
        from_attributes = True


# ─── Leaderboard ─────────────────────────────────────────────────────────────

class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    name: str
    roll_no: str
    r1_score: float
    r2_score: float
    r3_score: float
    total_score: float
    total_time_seconds: Optional[float]
