"""Duplicate-work detection.

Preferred engine: sentence-transformers embeddings + cosine similarity on the
normalized ACTIVITY_NAME / WORK_DESCRIPTION text. Falls back to a token
(Jaccard/word-overlap) similarity when the embeddings model is unavailable so
the service always runs.

To stay fast on thousands of records, we bucket by a coarse normalized activity
signature first and only compare records sharing a bucket.
"""
from __future__ import annotations

import logging
import re
from collections import defaultdict
from typing import List, Optional, Dict, Tuple

from .models import WorkRecord

log = logging.getLogger("anomaly.dup")

STOP = {
    "the", "of", "and", "for", "in", "on", "a", "an", "to", "construction",
    "work", "works", "at", "project", "new", "with", "from", "as", "of",
}

_encoder = None
_model_name = None


def _load_encoder(model_name: str):
    global _encoder, _model_name
    if _encoder is not None and _model_name == model_name:
        return _encoder
    if _encoder is False:
        return None
    try:
        from sentence_transformers import SentenceTransformer

        log.info("Loading sentence-transformers model %s", model_name)
        _encoder = SentenceTransformer(model_name)
        _model_name = model_name
        log.info("Model loaded")
        return _encoder
    except Exception as exc:  # noqa: BLE001
        log.warning("Sentence-transformers unavailable (%s); using token fallback", exc)
        _encoder = False
        return None


def load_dup(use_ml: bool, model_name: str) -> Optional[object]:
    if not use_ml:
        return None
    enc = _load_encoder(model_name)
    return enc if enc is not False else None


def _tokens(text: Optional[str]) -> List[str]:
    if not text:
        return []
    return [t for t in re.findall(r"[a-z0-9]+", text.lower()) if t not in STOP]


def _key(text: str) -> str:
    # coarse bucket key: first 3 content tokens (order-insensitive-ish)
    return " ".join(sorted(list(set(_tokens(text)))[:3]))


def _token_sim(a: str, b: str) -> float:
    ta, tb = set(_tokens(a)), set(_tokens(b))
    if not ta and not tb:
        return 1.0
    if not ta or not tb:
        return 0.0
    return len(ta & tb) / len(ta | tb)


def _embed_sim(model, a: str, b: str) -> float:
    try:
        vecs = model.encode([a, b], show_progress_bar=False, convert_to_numpy=True)
        import numpy as np

        va, vb = vecs[0], vecs[1]
        denom = (np.linalg.norm(va) * np.linalg.norm(vb)) or 1.0
        return float(np.dot(va, vb) / denom)
    except Exception:  # noqa: BLE001
        return 0.0


def _text(record: WorkRecord) -> str:
    return " ".join(filter(None, [record.ACTIVITY_NAME, record.WORK_DESCRIPTION]))


def find_duplicates(
    records: List[WorkRecord],
    threshold: float = 0.62,
    model=None,
    model_name: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
) -> Dict[int, int]:
    """Return {record_index: sibling_count} for records that have a duplicate.

    Each flagged index maps to the number of other works sharing near-identical
    normalized text. Uses embedding similarity when `model` is available,
    otherwise token (Jaccard) similarity.
    """
    if model is None:
        model = _load_encoder(model_name)
        if model is False:
            model = None

    texts = [_text(r) for r in records]
    buckets: Dict[str, List[int]] = defaultdict(list)
    for idx, txt in enumerate(texts):
        if not txt:
            continue
        buckets[_key(txt)].append(idx)

    siblings: Dict[int, int] = {}
    seen_pairs = set()

    for idxs in buckets.values():
        if len(idxs) < 2:
            continue
        for i in range(len(idxs)):
            for j in range(i + 1, len(idxs)):
                a, b = idxs[i], idxs[j]
                if (a, b) in seen_pairs or (b, a) in seen_pairs:
                    continue
                seen_pairs.add((a, b))
                if model is not None:
                    sim = _embed_sim(model, texts[a], texts[b])
                else:
                    sim = _token_sim(texts[a], texts[b])
                if sim >= threshold:
                    siblings[a] = siblings.get(a, 0) + 1
                    siblings[b] = siblings.get(b, 0) + 1
                if len(seen_pairs) > 400000:  # hard cap; large states stay responsive
                    log.warning("Duplicate scan hit pair cap")
                    return siblings

    return siblings
