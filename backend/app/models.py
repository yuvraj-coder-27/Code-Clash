from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    roll_no = Column(String(50), unique=True, index=True, nullable=False)
    role = Column(String(20), default="participant")  # "participant" | "admin"
    created_at = Column(DateTime, default=datetime.utcnow)

    # Per-round timestamps for duration calculation
    r1_start = Column(DateTime, nullable=True)
    r1_end = Column(DateTime, nullable=True)
    r2_start = Column(DateTime, nullable=True)
    r2_end = Column(DateTime, nullable=True)
    r3_start = Column(DateTime, nullable=True)
    r3_end = Column(DateTime, nullable=True)

    submissions = relationship("Submission", back_populates="user", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    round = Column(Integer, nullable=False, index=True)   # 1, 2, or 3
    order = Column(Integer, default=1)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    language = Column(String(20), nullable=False)          # "c", "cpp", "python"

    # Pre-filled buggy code (R1), snippet (R2), starter (R3)
    code_template = Column(Text, nullable=True)

    # Round 2 MCQ
    mcq_options = Column(JSON, nullable=True)              # ["25", "Error", "None", "30"]
    correct_option_index = Column(Integer, nullable=True)  # 0-based

    # Rounds 1 & 3
    # [{"input": "5\n", "expected_output": "10\n", "is_hidden": false}]
    test_cases = Column(JSON, nullable=True)

    points = Column(Integer, default=10)

    submissions = relationship("Submission", back_populates="question", cascade="all, delete-orphan")


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False, index=True)
    round = Column(Integer, nullable=False)

    submitted_code = Column(Text, nullable=True)
    selected_option = Column(Integer, nullable=True)       # Round 2

    is_correct = Column(Boolean, default=False)
    attempts_used = Column(Integer, default=1)
    marks_awarded = Column(Float, default=0.0)
    test_results = Column(JSON, nullable=True)             # per-case pass/fail detail
    execution_output = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="submissions")
    question = relationship("Question", back_populates="submissions")
