"""NLP / free-text risk scoring on WORK_DESCRIPTION and ACTIVITY_NAME.

When an embedding model is loaded (shared with duplicate detection) we use a
small ML scoring pass via sentence embeddings against a small set of risk
prototype texts. Otherwise fall back to keyword-weighted scoring.
"""
from __future__ import annotations

import re
from typing import List, Tuple

from .models import WorkRecord

RISK_PROTOTYPES = [
    "cost overrun or budget revision",
    "delay in project execution",
    "quality concerns in construction",
    "duplicate or repeated sanctioned work",
    "survey or estimate not yet completed",
    "emergency or disaster related work",
    "maintenance or repair backlog",
]

KEYWORDS = [
    ("overrun", 14), ("revised estimate", 14), ("additional", 9),
    ("duplicate", 16), ("repeat", 12), ("renewal", 11), ("reconstruction", 11),
    ("emergency", 14), ("flood", 12), ("disaster", 14), ("repair", 7),
    ("incomplete", 12), ("pending", 10), ("survey", 9), ("estimate", 10),
    ("boundary wall", 6), ("no sanction", 16), ("stalled", 15),
]


def _text(record: WorkRecord) -> str:
    return " ".join(filter(None, [record.WORK_DESCRIPTION, record.ACTIVITY_NAME]))


def keyword_nlp(record: WorkRecord) -> Tuple[int, List[str]]:
    text = _text(record).lower()
    if not text:
        return 0, []
    score = 0
    hits = []
    for kw, w in KEYWORDS:
        if kw in text:
            score += w
            hits.append(kw)
    score = min(100, score * 7)
    return score, hits


_embed = None


def load_nlp(model):
    global _embed
    if model is not None:
        _embed = model
    return _embed is not None


def embed_nlp(record: WorkRecord) -> Tuple[int, List[str]]:
    """ML scoring by embedding the work text and nearest risk prototype."""
    text = _text(record)
    if not text or _embed is None:
        return keyword_nlp(record)
    try:
        import numpy as np

        vecs = _embed.encode([text] + RISK_PROTOTYPES, show_progress_bar=False, convert_to_numpy=True)
        v = vecs[0]
        prots = vecs[1:]
        norms = np.linalg.norm(vecs, axis=1)[:, None] or 1.0
        cos = (vecs @ vecs.T) / (norms @ norms.T)
        best = float(cos[0, 1:].max())
        score = min(100, int(round(best * 200)))
        return score, ["ml_score"]
    except Exception:  # noqa: BLE001
        return keyword_nlp(record)
