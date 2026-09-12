FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    ANOMALY_USE_ML=${ANOMALY_USE_ML:-1} \
    ANOMALY_MODEL=${ANOMALY_MODEL:-sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2} \
    ANOMALY_CACHE_TTL=${ANOMALY_CACHE_TTL:-900}

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
