from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Question
from ..schemas import QuestionCreate, QuestionOut

router = APIRouter(prefix="/questions", tags=["questions"])


@router.get("/round/{round_num}", response_model=list[QuestionOut])
def get_questions_for_round(round_num: int, db: Session = Depends(get_db)):
    if round_num not in (1, 2, 3):
        raise HTTPException(status_code=400, detail="Invalid round number")
    questions = (
        db.query(Question)
        .filter(Question.round == round_num)
        .order_by(Question.order)
        .all()
    )
    # Strip correct answer data for participants
    for q in questions:
        q.correct_option_index = None  # never expose to frontend
    return questions


@router.get("/{question_id}", response_model=QuestionOut)
def get_question(question_id: int, db: Session = Depends(get_db)):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    q.correct_option_index = None
    return q


@router.post("/", response_model=QuestionOut)
def create_question(data: QuestionCreate, db: Session = Depends(get_db)):
    q = Question(**data.model_dump())
    db.add(q)
    db.commit()
    db.refresh(q)
    return q


@router.delete("/{question_id}")
def delete_question(question_id: int, db: Session = Depends(get_db)):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    db.delete(q)
    db.commit()
    return {"detail": "Deleted"}
