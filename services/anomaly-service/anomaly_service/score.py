"""Combine rule + ML signals into an overall 0-100 risk score and anomaly type."""
from __future__ import annotations

from typing import Dict, List

from .models import WorkRecord


def overall_risk(components: Dict[str, int]) -> int:
    """Weighted blend of per-signal scores (0-100 each)."""
    weights = {
        "cost": 0.30,
        "delay": 0.25,
        "compliance": 0.20,
        "duplicate": 0.15,
        "nlp": 0.10,
    }
    total = 0.0
    wsum = 0.0
    for key, w in weights.items():
        if key in components and components[key] > 0:
            total += components[key] * w
            wsum += w
    if wsum == 0:
        return 0
    return min(100, int(round(total / wsum)))


def classify_anomalies(
    records: List[WorkRecord],
    components: Dict[int, Dict[str, int]],
) -> List[Dict]:
    """Return anomalies with a dominant type and overall risk.

    components maps each record index -> {cost, delay, compliance, duplicate, nlp}
    """
    anomalies = []
    for idx, comp in components.items():
        overall = overall_risk(comp)

        # dominant type by highest component
        typ, _ = max(comp.items(), key=lambda kv: kv[1])
        type_label = {
            "cost": "Cost Overrun",
            "delay": "Delay Prediction",
            "compliance": "Compliance Issue",
            "duplicate": "Duplicate Work",
            "nlp": "NLP Flag",
        }[typ]
        record = records[idx]

        # Only surface things worth reviewing
        if overall >= 30 or comp.get("duplicate", 0) >= 40:
            anomalies.append({
                "idx": idx,
                "type": type_label,
                "overall": overall,
            })
    return anomalies
