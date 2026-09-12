"""Uvicorn entrypoint.

Run:  uvicorn app:app --host 0.0.0.0 --port 8000
or:   python app.py
"""
import uvicorn

from anomaly_service.main import app

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=False)
