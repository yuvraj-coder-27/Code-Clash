from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Question
from ..schemas import QuestionOut

router = APIRouter(prefix="/questions", tags=["questions"])


@router.get("/round/{round_num}", response_model=List[QuestionOut])
def get_questions_by_round(round_num: int, db: Session = Depends(get_db)):
    if round_num not in (1, 2, 3):
        raise HTTPException(status_code=400, detail="Invalid round. Must be 1, 2, or 3.")

    questions = (
        db.query(Question)
        .filter(Question.round == round_num)
        .order_by(Question.order.asc())
        .all()
    )

    # Return clean QuestionOut (without correct_option_index)
    return questions


@router.get("/{question_id}", response_model=QuestionOut)
def get_question(question_id: int, db: Session = Depends(get_db)):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    return q
