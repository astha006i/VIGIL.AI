"""Rule-based detectors for structured MPLADS signals.

These produce explainable, threshold-driven signals. They are intentionally
kept separate from the ML/NLP engines so the risk attribution stays auditable.
"""
from __future__ import annotations

import re
from datetime import datetime, date
from typing import List, Tuple, Optional

from .models import WorkRecord

DATE_FORMATS = ["%d-%b-%Y", "%Y-%m-%d", "%d/%m/%Y", "%b %d, %Y"]


def parse_date(value: Optional[str]) -> Optional[date]:
    if not value:
        return None
    value = value.strip()
    for fmt in DATE_FORMATS:
        try:
            return datetime.strptime(value, fmt).date()
        except ValueError:
            continue
    # fallback: try month-name american style e.g. "Dec 16, 2024"
    try:
        return datetime.strptime(value, "%b %d, %Y").date()
    except ValueError:
        return None


def _to_float(value) -> Optional[float]:
    try:
        if value is None or value == "":
            return None
        return float(value)
    except (TypeError, ValueError):
        return None


def days_since(day: Optional[date], ref: Optional[date] = None) -> Optional[int]:
    if day is None:
        return None
    ref = ref or date.today()
    return (ref - day).days


def detect_cost_overrun(record: WorkRecord) -> Tuple[int, str]:
    """Risk from SANCTION_AMOUNT exceeding RECOMMENDED_AMOUNT."""
    rec = _to_float(record.RECOMMENDED_AMOUNT)
    san = _to_float(record.SANCTION_AMOUNT)
    if rec is None or san is None or rec <= 0:
        return 0, "Insufficient cost data"
    overrun = (san - rec) / rec
    if overrun <= 0:
        return 0, "On budget"
    # scale: 0% -> 0, 50% -> 60, 100%+ -> 100
    risk = min(100, int(round(overrun / 0.5 * 60)))
    return risk, f"Cost overrun {overrun*100:.0f}%"


def detect_delay(record: WorkRecord, tenure_end: Optional[str] = None) -> Tuple[int, str]:
    """Delay risk from time between recommendation and sanction, and tenure pressure."""
    rec_d = parse_date(record.RECOMMENDATION_DATE)
    san_d = parse_date(record.SANCTION_DATE)
    risk = 0
    notes = []

    if rec_d and san_d:
        gap = (san_d - rec_d).days
        if gap > 365:
            risk = max(risk, 80)
            notes.append(f"Sanctioned {gap} days after recommendation")
        elif gap > 180:
            risk = max(risk, 60)
            notes.append(f"Sanctioned {gap} days after recommendation")
        elif gap > 90:
            risk = max(risk, 40)
            notes.append(f"Sanctioned {gap} days after recommendation")
    elif rec_d and not san_d:
        age = days_since(rec_d)
        if age is not None:
            if age > 365:
                risk = max(risk, 85)
                notes.append(f"Recommended {age} days ago, not sanctioned")
            elif age > 180:
                risk = max(risk, 65)
                notes.append(f"Recommended {age} days ago, not sanctioned")

    if tenure_end:
        tend = parse_date(tenure_end)
        if tend and not san_d:
            remaining = (tend - date.today()).days
            if remaining < 0:
                risk = max(risk, 90)
                notes.append("No sanction after tenure end")
            elif remaining < 90:
                risk = max(risk, 70)
                notes.append(f"Unsanctioned, tenure ends in {remaining} days")

    return risk, "; ".join(notes) if notes else "On schedule"


def detect_compliance(record: WorkRecord) -> Tuple[int, str]:
    """Compliance risk from works stuck at an early stage or missing letter."""
    stage = (record.WORK_STAGE or "").strip().lower()
    risk = 0
    notes = []

    if not stage:
        risk = max(risk, 40)
        notes.append("No work stage recorded")

    early_stages = {
        "time estimation": 65,
        "proposal prepared": 45,
        "work not started": 55,
        "started": 30,
    }
    for key, val in early_stages.items():
        if key in stage:
            risk = max(risk, val)
            notes.append(f"Early stage: {record.WORK_STAGE}")

    if not record.LETTER_NO:
        risk = max(risk, 50)
        notes.append("Missing letter number")

    return risk, "; ".join(notes) if notes else "Compliant"


NLP_KEYWORDS = [
    ("water", 8), ("sanitation", 12), ("school", 6), ("hospital", 8),
    ("road", 4), ("bridge", 8), ("boundary", 6), ("wall", 4),
    ("renewal", 10), ("survey", 10), ("estimate", 12), ("repair", 6),
    ("purchase", 4), ("books", 10), ("furniture", 8), ("maintenance", 8),
    ("electrification", 10), ("drainage", 10), ("sewage", 12), ("flood", 12),
    ("emergency", 14), ("revised", 12), ("additional", 8), ("change", 8),
]


def detect_nlp_keywords(record: WorkRecord) -> Tuple[int, str]:
    """Lightweight keyword scoring on WORK_DESCRIPTION/ACTIVITY_NAME.

    Used only as a fallback when embeddings are unavailable; the Python service
    prefers ML-based description scoring where possible.
    """
    text = " ".join(
        filter(None, [record.WORK_DESCRIPTION, record.ACTIVITY_NAME])
    ).lower()
    if not text:
        return 0, "No description"
    score = 0
    hits = []
    for kw, weight in NLP_KEYWORDS:
        if kw in text:
            score += weight
            hits.append(kw)
    score = min(100, score * 6)
    return score, ", ".join(hits[:5]) if hits else "No risk keywords"
