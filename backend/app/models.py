from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .database import Base


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    team_name = Column(String(100), unique=True, index=True, nullable=False)
    passcode = Column(String(50), nullable=False)
    role = Column(String(20), default="team")  # "team" | "admin"
    created_at = Column(DateTime, default=datetime.utcnow)

    # Team Members (2 or 3 members)
    member1_name = Column(String(100), nullable=False)
    member1_roll = Column(String(50), nullable=False)
    member2_name = Column(String(100), nullable=False)
    member2_roll = Column(String(50), nullable=False)
    member3_name = Column(String(100), nullable=True)
    member3_roll = Column(String(50), nullable=True)

    # Round locks: Which member claimed which round
    round1_claimed_by = Column(String(100), nullable=True)
    round2_claimed_by = Column(String(100), nullable=True)
    round3_claimed_by = Column(String(100), nullable=True)

    # Per-round timestamps for duration calculation
    r1_start = Column(DateTime, nullable=True)
    r1_end = Column(DateTime, nullable=True)
    r2_start = Column(DateTime, nullable=True)
    r2_end = Column(DateTime, nullable=True)
    r3_start = Column(DateTime, nullable=True)
    r3_end = Column(DateTime, nullable=True)

    submissions = relationship("Submission", back_populates="team", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    round = Column(Integer, nullable=False, index=True)   # 1 (C/C++), 2 (Python), 3 (DSA)
    order = Column(Integer, default=1)                   # 1 to 10
    question_type = Column(String(20), default="debugging")  # "mcq" | "debugging"
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    language = Column(String(20), nullable=False)        # "c", "cpp", "python"

    # Pre-filled buggy code or starter code
    code_template = Column(Text, nullable=True)

    # For MCQ questions
    mcq_options = Column(JSON, nullable=True)              # ["Option A", "Option B", ...]
    correct_option_index = Column(Integer, nullable=True)  # 0-based

    # For Debugging questions (test cases)
    # [{"input": "5\n", "expected_output": "10", "is_hidden": false}]
    test_cases = Column(JSON, nullable=True)

    points = Column(Integer, default=10)

    submissions = relationship("Submission", back_populates="question", cascade="all, delete-orphan")


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False, index=True)
    member_name = Column(String(100), nullable=True)      # which member submitted
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False, index=True)
    round = Column(Integer, nullable=False)

    submitted_code = Column(Text, nullable=True)
    selected_option = Column(Integer, nullable=True)       # for MCQ

    is_correct = Column(Boolean, default=False)
    attempts_used = Column(Integer, default=0)
    marks_awarded = Column(Float, default=0.0)
    test_results = Column(JSON, nullable=True)
    execution_output = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    team = relationship("Team", back_populates="submissions")
    question = relationship("Question", back_populates="submissions")
