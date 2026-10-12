from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import User, Submission
from ..schemas import LeaderboardEntry

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("/", response_model=list[LeaderboardEntry])
def get_leaderboard(db: Session = Depends(get_db)):
    participants = db.query(User).filter(User.role == "participant").all()

    entries = []
    for user in participants:
        subs = db.query(Submission).filter(Submission.user_id == user.id).all()

        r1_score = sum(s.marks_awarded for s in subs if s.round == 1)
        r2_score = sum(s.marks_awarded for s in subs if s.round == 2)
        r3_score = sum(s.marks_awarded for s in subs if s.round == 3)
        total = r1_score + r2_score + r3_score

        # Total active time in seconds across all rounds
        total_time = 0.0
        for start, end in [
            (user.r1_start, user.r1_end),
            (user.r2_start, user.r2_end),
            (user.r3_start, user.r3_end),
        ]:
            if start and end:
                total_time += (end - start).total_seconds()

        entries.append(
            LeaderboardEntry(
                rank=0,  # assigned after sorting
                user_id=user.id,
                name=user.name,
                roll_no=user.roll_no,
                r1_score=r1_score,
                r2_score=r2_score,
                r3_score=r3_score,
                total_score=total,
                total_time_seconds=total_time or None,
            )
        )

    # Sort: higher score first, then faster time
    entries.sort(
        key=lambda e: (-e.total_score, e.total_time_seconds if e.total_time_seconds else float("inf"))
    )

    for i, e in enumerate(entries):
        e.rank = i + 1

    return entries
