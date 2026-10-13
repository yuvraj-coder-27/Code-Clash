from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import asyncio
from functools import partial

from ..database import get_db
from ..models import User, Question, Submission
from ..schemas import SubmitBugFix, SubmitMCQ, SubmitReverse, SubmissionOut
from ..executor import evaluate_against_test_cases
from ..config import ROUND_CONFIG

router = APIRouter(prefix="/submit", tags=["submissions"])


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _get_or_create_submission(db, user_id, question_id, round_num) -> Submission:
    """Return the existing submission record or a fresh one."""
    sub = (
        db.query(Submission)
        .filter(Submission.user_id == user_id, Submission.question_id == question_id)
        .first()
    )
    if not sub:
        sub = Submission(
            user_id=user_id,
            question_id=question_id,
            round=round_num,
            attempts_used=0,
        )
        db.add(sub)
    return sub


async def _evaluate_async(language: str, code: str, test_cases: list) -> dict:
    """Run evaluate_against_test_cases in a thread so the event loop stays free."""
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(
        None,
        partial(evaluate_against_test_cases, language, code, test_cases),
    )


# ─── Round 1: Bug Finding & Fixing ────────────────────────────────────────────

@router.post("/round1", response_model=SubmissionOut)
async def submit_bug_fix(data: SubmitBugFix, db: Session = Depends(get_db)):
    max_attempts = ROUND_CONFIG[1]["max_attempts"]  # 3

    q = db.query(Question).filter(Question.id == data.question_id, Question.round == 1).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")

    sub = _get_or_create_submission(db, data.user_id, data.question_id, 1)

    if sub.is_correct:
        raise HTTPException(status_code=400, detail="Already solved!")

    if sub.attempts_used >= max_attempts:
        raise HTTPException(status_code=403, detail="No attempts remaining. Question is locked.")

    # Validate language is c or cpp only
    if data.language not in ("c", "cpp"):
        raise HTTPException(status_code=400, detail="Round 1 only supports C and C++")

    # Track round start time
    user = db.query(User).filter(User.id == data.user_id).first()
    if user and not user.r1_start:
        user.r1_start = datetime.utcnow()

    sub.attempts_used += 1
    sub.submitted_code = data.code
    sub.submitted_at = datetime.utcnow()

    # ← runs in thread pool; event loop free to handle other requests
    eval_result = await _evaluate_async(data.language, data.code, q.test_cases or [])
    sub.test_results = eval_result["results"]

    if eval_result["ratio"] == 1.0:
        sub.is_correct = True
        # Marks decrease per attempt: 100% → 80% → 60%
        pct = [1.0, 0.8, 0.6][sub.attempts_used - 1]
        sub.marks_awarded = round(q.points * pct, 2)
        sub.execution_output = "✅ All test cases passed!"
        if user:
            user.r1_end = datetime.utcnow()
    else:
        passed = eval_result["passed"]
        total  = eval_result["total"]
        sub.is_correct = False
        sub.marks_awarded = 0.0
        sub.execution_output = f"❌ {passed}/{total} test cases passed"

    db.commit()
    db.refresh(sub)
    return sub


# ─── Round 2: Guess the Output (MCQ) ─────────────────────────────────────────

@router.post("/round2", response_model=SubmissionOut)
async def submit_mcq(data: SubmitMCQ, db: Session = Depends(get_db)):
    q = db.query(Question).filter(Question.id == data.question_id, Question.round == 2).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")

    sub = _get_or_create_submission(db, data.user_id, data.question_id, 2)

    if sub.attempts_used >= 1:
        raise HTTPException(status_code=403, detail="Already submitted. Only 1 attempt allowed.")

    user = db.query(User).filter(User.id == data.user_id).first()
    if user and not user.r2_start:
        user.r2_start = datetime.utcnow()

    sub.attempts_used = 1
    sub.selected_option = data.selected_option
    sub.submitted_at = datetime.utcnow()

    correct = q.correct_option_index
    if data.selected_option == correct:
        sub.is_correct = True
        sub.marks_awarded = float(q.points)
        sub.execution_output = "✅ Correct!"
    else:
        sub.is_correct = False
        sub.marks_awarded = 0.0
        sub.execution_output = f"❌ Incorrect. Correct answer was option {correct + 1}."

    if user:
        user.r2_end = datetime.utcnow()

    db.commit()
    db.refresh(sub)
    return sub


# ─── Round 3: Reverse Coding ──────────────────────────────────────────────────

@router.post("/round3", response_model=SubmissionOut)
async def submit_reverse(data: SubmitReverse, db: Session = Depends(get_db)):
    if data.language not in ("c", "cpp", "python"):
        raise HTTPException(status_code=400, detail="Invalid language")

    q = db.query(Question).filter(Question.id == data.question_id, Question.round == 3).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")

    user = db.query(User).filter(User.id == data.user_id).first()
    if user and not user.r3_start:
        user.r3_start = datetime.utcnow()

    sub = _get_or_create_submission(db, data.user_id, data.question_id, 3)
    sub.attempts_used += 1
    sub.submitted_code = data.code
    sub.submitted_at = datetime.utcnow()

    # ← runs in thread pool; event loop free to handle other requests
    eval_result = await _evaluate_async(data.language, data.code, q.test_cases or [])
    sub.test_results = eval_result["results"]

    passed = eval_result["passed"]
    total  = eval_result["total"]
    ratio  = eval_result["ratio"]

    sub.marks_awarded = round(q.points * ratio, 2)
    sub.is_correct = ratio == 1.0
    sub.execution_output = f"{'✅' if ratio == 1.0 else '⚠️'} {passed}/{total} test cases passed"

    if sub.is_correct and user and not user.r3_end:
        user.r3_end = datetime.utcnow()

    db.commit()
    db.refresh(sub)
    return sub


# ─── Submission History ───────────────────────────────────────────────────────

@router.get("/history/{user_id}/{question_id}", response_model=SubmissionOut)
def get_submission(user_id: int, question_id: int, db: Session = Depends(get_db)):
    sub = (
        db.query(Submission)
        .filter(Submission.user_id == user_id, Submission.question_id == question_id)
        .first()
    )
    if not sub:
        raise HTTPException(status_code=404, detail="No submission found")
    return sub
