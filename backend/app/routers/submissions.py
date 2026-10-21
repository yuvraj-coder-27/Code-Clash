from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import asyncio
from functools import partial
from typing import List

from ..database import get_db
from ..models import Team, Question, Submission
from ..schemas import SubmitMCQ, SubmitDebugging, SubmissionOut
from ..executor import evaluate_against_test_cases

router = APIRouter(prefix="/submit", tags=["submissions"])


# --- Helpers ---

def _get_or_create_submission(db: Session, team_id: int, question_id: int, round_num: int, member_name: str) -> Submission:
    sub = (
        db.query(Submission)
        .filter(Submission.team_id == team_id, Submission.question_id == question_id)
        .first()
    )
    if not sub:
        sub = Submission(
            team_id=team_id,
            question_id=question_id,
            round=round_num,
            member_name=member_name,
            attempts_used=0,
            marks_awarded=0.0,
            is_correct=False,
        )
        db.add(sub)
    else:
        sub.member_name = member_name
    return sub


async def _evaluate_async(language: str, code: str, test_cases: list) -> dict:
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(
        None,
        partial(evaluate_against_test_cases, language, code, test_cases),
    )


def _check_and_update_round_time(db: Session, team: Team, round_num: int):
    """Update round end time if all questions in this round are solved/exhausted."""
    round_questions = db.query(Question).filter(Question.round == round_num).all()
    q_ids = [q.id for q in round_questions]
    subs = db.query(Submission).filter(Submission.team_id == team.id, Submission.question_id.in_(q_ids)).all()

    # If any question was answered, ensure round start is set
    now = datetime.utcnow()
    if round_num == 1 and not team.r1_start:
        team.r1_start = now
    elif round_num == 2 and not team.r2_start:
        team.r2_start = now
    elif round_num == 3 and not team.r3_start:
        team.r3_start = now

    # Check if all questions are finished (solved or attempts exhausted)
    if len(subs) == len(round_questions):
        all_finished = True
        for q in round_questions:
            s = next((x for x in subs if x.question_id == q.id), None)
            if not s:
                all_finished = False
                break
            max_att = 1 if q.question_type == "mcq" else 3
            if not s.is_correct and s.attempts_used < max_att:
                all_finished = False
                break
        if all_finished:
            if round_num == 1:
                team.r1_end = now
            elif round_num == 2:
                team.r2_end = now
            elif round_num == 3:
                team.r3_end = now


# --- Submit MCQ (1 attempt allowed) ---

@router.post("/mcq", response_model=SubmissionOut)
def submit_mcq(data: SubmitMCQ, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.id == data.team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    q = db.query(Question).filter(Question.id == data.question_id).first()
    if not q or q.question_type != "mcq":
        raise HTTPException(status_code=400, detail="Invalid question for MCQ submission")

    sub = _get_or_create_submission(db, data.team_id, data.question_id, q.round, data.member_name)

    if sub.attempts_used >= 1:
        raise HTTPException(status_code=403, detail="MCQ already submitted! Only 1 attempt is allowed.")

    sub.attempts_used = 1
    sub.selected_option = data.selected_option
    sub.submitted_at = datetime.utcnow()

    is_right = (data.selected_option == q.correct_option_index)
    sub.is_correct = is_right
    if is_right:
        sub.marks_awarded = float(q.points)
        sub.execution_output = "[CORRECT] Correct answer!"
    else:
        sub.marks_awarded = 0.0
        sub.execution_output = f"[WRONG] Incorrect. The correct option was option {q.correct_option_index + 1}."

    _check_and_update_round_time(db, team, q.round)

    db.commit()
    db.refresh(sub)
    return sub


# --- Submit Debugging (3 attempts max with mark deduction) ---

@router.post("/debugging", response_model=SubmissionOut)
async def submit_debugging(data: SubmitDebugging, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.id == data.team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    q = db.query(Question).filter(Question.id == data.question_id).first()
    if not q or q.question_type != "debugging":
        raise HTTPException(status_code=400, detail="Invalid question for Debugging submission")

    sub = _get_or_create_submission(db, data.team_id, data.question_id, q.round, data.member_name)

    if sub.is_correct:
        raise HTTPException(status_code=400, detail="Already solved by your team!")

    if sub.attempts_used >= 3:
        raise HTTPException(status_code=403, detail="No attempts remaining (3 max). Question is locked.")

    sub.attempts_used += 1
    sub.submitted_code = data.code
    sub.submitted_at = datetime.utcnow()

    eval_result = await _evaluate_async(data.language, data.code, q.test_cases or [])
    sub.test_results = eval_result["results"]

    passed = eval_result["passed"]
    total = eval_result["total"]
    ratio = eval_result["ratio"]

    if ratio == 1.0:
        sub.is_correct = True
        # Mark deduction: Attempt 1 = 100%, Attempt 2 = 70%, Attempt 3 = 40%
        multipliers = [1.0, 0.70, 0.40]
        mult = multipliers[min(sub.attempts_used - 1, 2)]
        sub.marks_awarded = round(q.points * mult, 2)
        sub.execution_output = f"[PASS] All {total}/{total} test cases passed on Attempt {sub.attempts_used}! (+{sub.marks_awarded} pts)"
    else:
        sub.is_correct = False
        sub.marks_awarded = 0.0
        remaining = 3 - sub.attempts_used
        if remaining > 0:
            sub.execution_output = f"[FAIL] {passed}/{total} test cases passed. {remaining} attempt(s) remaining."
        else:
            sub.execution_output = f"[LOCKED] {passed}/{total} test cases passed. All 3 attempts exhausted. 0 points."

    _check_and_update_round_time(db, team, q.round)

    db.commit()
    db.refresh(sub)
    return sub


# --- Get Team Submissions (live sync for all devices) ---

@router.get("/team/{team_id}", response_model=List[SubmissionOut])
def get_team_submissions(team_id: int, db: Session = Depends(get_db)):
    return db.query(Submission).filter(Submission.team_id == team_id).all()
