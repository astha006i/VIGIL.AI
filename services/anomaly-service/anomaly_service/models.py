from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class WorkRecord(BaseModel):
    WORK_RECOMMENDATION_DTL_ID: Optional[int] = None
    STATE_NAME: Optional[str] = None
    CONSTITUENCY: Optional[str] = None
    CONSTITUENCY_ID: Optional[int] = None
    ACTIVITY_NAME: Optional[str] = None
    WORK_DESCRIPTION: Optional[str] = None
    WORK_CATEGORY: Optional[str] = None
    WORK_STAGE: Optional[str] = None
    RECOMMENDED_AMOUNT: Optional[float] = None
    SANCTION_AMOUNT: Optional[float] = None
    RECOMMENDATION_DATE: Optional[str] = None
    SANCTION_DATE: Optional[str] = None
    LETTER_NO: Optional[str] = None
    TENURE: Optional[str] = None
    TENURE_START_DATE: Optional[str] = None
    TENURE_END_DATE: Optional[str] = None
    MP_NAME: Optional[str] = None
    IDA_NAME: Optional[str] = None


class DetectRequest(BaseModel):
    state: Optional[str] = None
    state_id: Optional[int] = None
    tenure_start: Optional[str] = None
    tenure_end: Optional[str] = None
    records: List[WorkRecord] = Field(default_factory=list)


class Anomaly(BaseModel):
    id: str
    date: str
    project: str
    state: str
    constituency: Optional[str] = None
    type: str
    risk: int
    amount: Optional[float] = None
    description: Optional[str] = None
    snippet: Optional[str] = None
    work_id: Optional[int] = None
    score: Dict[str, Any] = Field(default_factory=dict)


class KPIs(BaseModel):
    total: int = 0
    high_risk: int = 0
    projects_affected: int = 0
    avg_risk: float = 0.0


class DetectResponse(BaseModel):
    state: Optional[str] = None
    state_id: Optional[int] = None
    scanned_at: str
    anomalies: List[Anomaly] = Field(default_factory=list)
    kpis: KPIs = Field(default_factory=KPIs)
    total_records: int = 0
    engines: Dict[str, Any] = Field(default_factory=dict)
