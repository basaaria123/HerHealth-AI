from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class SymptomCreate(BaseModel):
    date: date

    symptom_type: Literal[
        "menstrual_pain",
        "fatigue",
        "bleeding",
        "mood_change",
        "headache",
        "other",
    ]

    pain_severity: int | None = Field(default=None, ge=0, le=10)
    duration_minutes: int | None = Field(default=None, ge=1, le=10080)

    bleeding_level: Literal["light", "medium", "heavy"] | None = None

    mood: Literal[
        "happy",
        "calm",
        "anxious",
        "sad",
        "irritable",
        "other",
    ] | None = None

    fatigue_level: int | None = Field(default=None, ge=0, le=10)
    notes: str | None = Field(default=None, max_length=1000)


class SymptomResponse(SymptomCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int


class HealthResponse(BaseModel):
    status: str
    message: str


class DeleteResponse(BaseModel):
    message: str
    id: int
