from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from ..database import get_db
from ..models import Team
from ..schemas import TeamRegister, TeamLogin, TeamClaimRound, TeamOut

router = APIRouter(prefix="/teams", tags=["teams"])


@router.post("/register", response_model=TeamOut)
def register_team(data: TeamRegister, db: Session = Depends(get_db)):
    # Check if team name already taken
    existing = db.query(Team).filter(Team.team_name == data.team_name.strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Team name already taken! Please choose another.")

    team = Team(
        team_name=data.team_name.strip(),
        passcode=data.passcode.strip(),
        member1_name=data.member1_name.strip(),
        member1_roll=data.member1_roll.strip(),
        member2_name=data.member2_name.strip(),
        member2_roll=data.member2_roll.strip(),
        member3_name=data.member3_name.strip() if data.member3_name else None,
        member3_roll=data.member3_roll.strip() if data.member3_roll else None,
    )
    db.add(team)
    db.commit()
    db.refresh(team)
    return team


@router.post("/login", response_model=TeamOut)
def login_team(data: TeamLogin, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.team_name == data.team_name.strip()).first()
    if not team or team.passcode != data.passcode.strip():
        raise HTTPException(status_code=401, detail="Invalid team name or passcode!")
    return team


@router.get("/{team_id}", response_model=TeamOut)
def get_team(team_id: int, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team


@router.get("/", response_model=List[TeamOut])
def list_teams(db: Session = Depends(get_db)):
    return db.query(Team).order_by(Team.created_at.desc()).all()


@router.post("/claim-round", response_model=TeamOut)
def claim_round(data: TeamClaimRound, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.id == data.team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    member = data.member_name.strip()
    round_num = data.round_num

    # Validate that member belongs to this team
    valid_members = [team.member1_name, team.member2_name]
    if team.member3_name:
        valid_members.append(team.member3_name)

    if member not in valid_members:
        raise HTTPException(status_code=400, detail=f"{member} is not registered in team {team.team_name}")

    # Enforce: "each member can do only one round of their selected one according to their knowledge"
    # If 3 members: strictly 1 round per member
    # If 2 members: each must pick 1 round first; remaining 3rd round can be picked by either once rounds 1 & 2 are claimed
    claimed_rounds = {
        1: team.round1_claimed_by,
        2: team.round2_claimed_by,
        3: team.round3_claimed_by,
    }

    # If already claimed by someone else
    already_owner = claimed_rounds.get(round_num)
    if already_owner and already_owner != member:
        raise HTTPException(
            status_code=403,
            detail=f"Round {round_num} is already locked and assigned to {already_owner}!"
        )

    # Check if this member has already claimed a DIFFERENT round
    member_claimed_rounds = [r for r, m in claimed_rounds.items() if m == member]
    is_3_member_team = bool(team.member3_name)

    if is_3_member_team and member_claimed_rounds and round_num not in member_claimed_rounds:
        raise HTTPException(
            status_code=403,
            detail=f"You ({member}) have already claimed Round {member_claimed_rounds[0]}. In a 3-member team, each member is restricted to their chosen round!"
        )

    # For 2-member team: can only claim a second round if both members have already claimed at least 1 round
    if not is_3_member_team and len(member_claimed_rounds) >= 1 and round_num not in member_claimed_rounds:
        # Check if other member has claimed their round
        other_member = team.member2_name if member == team.member1_name else team.member1_name
        other_claimed = any(m == other_member for m in claimed_rounds.values())
        if not other_claimed:
            raise HTTPException(
                status_code=403,
                detail=f"Wait for your teammate ({other_member}) to claim their round before taking the 3rd round!"
            )

    # Assign round
    now = datetime.utcnow()
    if round_num == 1:
        team.round1_claimed_by = member
        if not team.r1_start:
            team.r1_start = now
    elif round_num == 2:
        team.round2_claimed_by = member
        if not team.r2_start:
            team.r2_start = now
    elif round_num == 3:
        team.round3_claimed_by = member
        if not team.r3_start:
            team.r3_start = now

    db.commit()
    db.refresh(team)
    return team
