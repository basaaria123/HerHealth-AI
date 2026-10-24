
from contextlib import asynccontextmanager
from datetime import date

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app.insights import generate_insights
from app.models import Symptom
from app.schemas import (
    DeleteResponse,
    HealthResponse,
    SymptomCreate,
    SymptomResponse,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="HerHealth AI API",
    description=(
        "Symptom tracking and transparent, non-diagnostic health observations."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type"],
)


@app.get("/api/health", response_model=HealthResponse)
def health_check():
    return {
        "status": "ok",
        "message": "HerHealth AI backend is running.",
    }


@app.post(
    "/api/symptoms",
    response_model=SymptomResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_symptom(
    payload: SymptomCreate,
    db: Session = Depends(get_db),
):
    entry = Symptom(**payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@app.get("/api/symptoms", response_model=list[SymptomResponse])
def list_symptoms(
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    return (
        db.query(Symptom)
        .order_by(Symptom.date.desc(), Symptom.id.desc())
        .limit(limit)
        .all()
    )


@app.delete("/api/symptoms/{id}", response_model=DeleteResponse)
def delete_symptom(
    id: int,
    db: Session = Depends(get_db),
):
    entry = db.query(Symptom).filter(Symptom.id == id).first()

    if entry is None:
        raise HTTPException(
            status_code=404,
            detail=f"Symptom entry {id} was not found.",
        )

    db.delete(entry)
    db.commit()

    return {
        "message": "Symptom entry deleted.",
        "id": id,
    }


@app.get("/api/insights")
def get_insights(db: Session = Depends(get_db)):
    entries = (
        db.query(Symptom)
        .order_by(Symptom.date.asc(), Symptom.id.asc())
        .all()
    )
    return generate_insights(entries)


@app.get("/api/reports/summary")
def get_doctor_summary(db: Session = Depends(get_db)):
    entries = (
        db.query(Symptom)
        .order_by(Symptom.date.asc(), Symptom.id.asc())
        .all()
    )

    disclaimer = (
        "This report summarizes user-recorded information only. "
        "It is not a medical diagnosis or a substitute for professional "
        "medical advice. Review the contents before sharing."
    )

    symptom_frequency = {}
    for entry in entries:
        symptom_frequency[entry.symptom_type] = (
            symptom_frequency.get(entry.symptom_type, 0) + 1
        )

    pain_scores = [
        entry.pain_severity
        for entry in entries
        if entry.pain_severity is not None
    ]

    average_pain = (
        round(sum(pain_scores) / len(pain_scores), 2)
        if pain_scores
        else None
    )

    history = [
        {
            "date": entry.date.isoformat(),
            "symptom_type": entry.symptom_type,
            "pain_severity": entry.pain_severity,
            "duration_minutes": entry.duration_minutes,
            "bleeding_level": entry.bleeding_level,
            "mood": entry.mood,
            "fatigue_level": entry.fatigue_level,
            "notes": entry.notes,
        }
        for entry in entries
    ]

    reporting_period = (
        {
            "start": entries[0].date.isoformat(),
            "end": entries[-1].date.isoformat(),
        }
        if entries
        else None
    )

    return {
        "generated_on": date.today().isoformat(),
        "reporting_period": reporting_period,
        "total_entries": len(entries),
        "symptom_frequency": dict(sorted(symptom_frequency.items())),
        "average_pain_severity": average_pain,
        "history": history,
        "disclaimer": disclaimer,
    }
