from sqlalchemy import Column, Date, Integer, String, Text

from app.database import Base


class Symptom(Base):
    __tablename__ = "symptoms"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    symptom_type = Column(String(50), nullable=False, index=True)
    pain_severity = Column(Integer, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    bleeding_level = Column(String(20), nullable=True)
    mood = Column(String(30), nullable=True)
    fatigue_level = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)