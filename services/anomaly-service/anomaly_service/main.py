"""FastAPI anomaly-detection microservice.

Rules-first + ML-for-text pipeline over MPLADS work records.

Endpoints:
  GET  /health      -> service + loaded-engine status
  POST /detect      -> analyze records and return anomalies + KPIs
"""
from __future__ import annotations

import logging
import os
from datetime import datetime

from fastapi import FastAPI

from .models import DetectRequest, DetectResponse, Anomaly, KPIs, WorkRecord
from . import detectors, dup, nlp, score

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("anomaly.main")

app = FastAPI(title="Vigil AI Anomaly Service", version="1.0.0")

USE_ML = os.getenv("ANOMALY_USE_ML", "1") == "1"
MODEL_NAME = os.getenv(
    "ANOMALY_MODEL", "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
)

_model_cache = None


def _load_model():
    global _model_cache
    if _model_cache is None:
        _model_cache = dup.load_dup(USE_ML, MODEL_NAME)
        nlp.load_nlp(_model_cache)
    return _model_cache


@app.get("/health")
def health():
    engines = {"use_ml": USE_ML, "model": MODEL_NAME if USE_ML else None}
    if USE_ML and _model_cache is None:
        try:
            _load_model()
            engines["model_loaded"] = True
        except Exception as exc:  # noqa: BLE001
            engines["model_loaded"] = False
            engines["error"] = str(exc)
    return {"status": "ok", "engines": engines}


def _summary(record: WorkRecord) -> dict:
    work_id = record.WORK_RECOMMENDATION_DTL_ID
    project = (
        record.ACTIVITY_NAME
        or (record.WORK_DESCRIPTION or "")[:60]
        or f"Work {work_id}"
    )
    return {
        "state": record.STATE_NAME or "",
        "constituency": record.CONSTITUENCY or "",
        "project": str(project)[:120],
        "description": record.WORK_DESCRIPTION or "",
        "work_id": work_id,
        "amount": record.SANCTION_AMOUNT or record.RECOMMENDED_AMOUNT,
        "date": record.SANCTION_DATE or record.RECOMMENDATION_DATE or "",
    }


@app.post("/detect")
def detect(payload: DetectRequest):
    records = payload.records
    _load_model()

    # Rule + NLP signals per record
    components: dict = {}
    for idx, rec in enumerate(records):
        comp = {}
        comp["cost"], _ = detectors.detect_cost_overrun(rec)
        comp["delay"], _ = detectors.detect_delay(rec, payload.tenure_end)
        comp["compliance"], _ = detectors.detect_compliance(rec)
        comp["nlp"], _ = nlp.embed_nlp(rec)
        components[idx] = comp

    # Duplicate pass (global)
    dup_counts = dup.find_duplicates(records, model=_model_cache)
    for idx, count in dup_counts.items():
        if idx in components:
            components[idx]["duplicate"] = min(100, 52 + count * 22)

    flagged = score.classify_anomalies(records, components)

    anomalies = []
    for item in flagged:
        idx = item["idx"]
        rec = records[idx]
        summ = _summary(rec)
        wid = summ["work_id"]
        anomalies.append(
            Anomaly(
                id=f"ANOM-{wid if wid is not None else idx}",
                date=summ["date"],
                project=summ["project"],
                state=summ["state"],
                constituency=summ["constituency"],
                type=item["type"],
                risk=item["overall"],
                amount=summ["amount"],
                description=summ["description"],
                snippet=(summ["description"] or "")[:110],
                work_id=wid,
                score=components[idx],
            ).model_dump()
        )

    high_risk = sum(1 for a in anomalies if a["risk"] >= 60)
    projects = len({a["work_id"] for a in anomalies if a["work_id"]})
    avg = round(sum(a["risk"] for a in anomalies) / len(anomalies)) if anomalies else 0

    return DetectResponse(
        state=payload.state,
        state_id=payload.state_id,
        scanned_at=datetime.utcnow().isoformat() + "Z",
        anomalies=anomalies,
        kpis=KPIs(
            total=len(anomalies),
            high_risk=high_risk,
            projects_affected=projects,
            avg_risk=avg,
        ),
        total_records=len(records),
        engines={
            "use_ml": USE_ML,
            "model": MODEL_NAME if USE_ML else None,
            "duplicates": len(dup_counts) or 0,
        },
    ).model_dump()
