from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


# ─── Team Schemas ─────────────────────────────────────────────────────────────

class TeamRegister(BaseModel):
    team_name: str
    passcode: str
    member1_name: str
    member1_roll: str
    member2_name: str
    member2_roll: str
    member3_name: Optional[str] = None
    member3_roll: Optional[str] = None


class TeamLogin(BaseModel):
    team_name: str
    passcode: str


class TeamClaimRound(BaseModel):
    team_id: int
    round_num: int
    member_name: str


class TeamOut(BaseModel):
    id: int
    team_name: str
    role: str
    member1_name: str
    member1_roll: str
    member2_name: str
    member2_roll: str
    member3_name: Optional[str] = None
    member3_roll: Optional[str] = None

    round1_claimed_by: Optional[str] = None
    round2_claimed_by: Optional[str] = None
    round3_claimed_by: Optional[str] = None

    r1_start: Optional[datetime] = None
    r1_end: Optional[datetime] = None
    r2_start: Optional[datetime] = None
    r2_end: Optional[datetime] = None
    r3_start: Optional[datetime] = None
    r3_end: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Question Schemas ─────────────────────────────────────────────────────────

class QuestionOut(BaseModel):
    id: int
    round: int
    order: int
    question_type: str  # "mcq" | "debugging"
    title: str
    description: str
    language: str
    code_template: Optional[str] = None
    mcq_options: Optional[List[str]] = None
    test_cases: Optional[List[dict]] = None
    points: int

    class Config:
        from_attributes = True


# ─── Submission Schemas ───────────────────────────────────────────────────────

class SubmitMCQ(BaseModel):
    team_id: int
    member_name: str
    question_id: int
    selected_option: int  # 0-based index


class SubmitDebugging(BaseModel):
    team_id: int
    member_name: str
    question_id: int
    code: str
    language: str  # "c", "cpp", "python"


class SubmissionOut(BaseModel):
    id: int
    team_id: int
    member_name: Optional[str]
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


# ─── Leaderboard Schema ───────────────────────────────────────────────────────

class LeaderboardEntry(BaseModel):
    rank: int
    team_id: int
    team_name: str
    members: List[str]
    r1_score: float
    r2_score: float
    r3_score: float
    total_score: float
    total_time_seconds: Optional[float]
