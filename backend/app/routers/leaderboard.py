from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Team, Submission
from ..schemas import LeaderboardEntry

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("/", response_model=List[LeaderboardEntry])
def get_leaderboard(db: Session = Depends(get_db)):
    teams = db.query(Team).filter(Team.role == "team").all()

    entries = []
    for team in teams:
        subs = db.query(Submission).filter(Submission.team_id == team.id).all()

        r1_score = sum(s.marks_awarded for s in subs if s.round == 1)
        r2_score = sum(s.marks_awarded for s in subs if s.round == 2)
        r3_score = sum(s.marks_awarded for s in subs if s.round == 3)
        total = round(r1_score + r2_score + r3_score, 2)

        # Total active time across rounds
        total_time = 0.0
        for start, end in [
            (team.r1_start, team.r1_end),
            (team.r2_start, team.r2_end),
            (team.r3_start, team.r3_end),
        ]:
            if start and end:
                total_time += (end - start).total_seconds()

        members = [f"{team.member1_name} ({team.member1_roll})", f"{team.member2_name} ({team.member2_roll})"]
        if team.member3_name:
            members.append(f"{team.member3_name} ({team.member3_roll})")

        entries.append(
            LeaderboardEntry(
                rank=0,
                team_id=team.id,
                team_name=team.team_name,
                members=members,
                r1_score=r1_score,
                r2_score=r2_score,
                r3_score=r3_score,
                total_score=total,
                total_time_seconds=total_time or None,
            )
        )

    # Sort: highest total_score first, tie-breaker: least time
    entries.sort(
        key=lambda e: (-e.total_score, e.total_time_seconds if e.total_time_seconds else float("inf"))
    )

    for i, e in enumerate(entries):
        e.rank = i + 1

    return entries
