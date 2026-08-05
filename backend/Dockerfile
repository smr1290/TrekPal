FROM python:3.11-slim

WORKDIR /app

# System deps for psycopg2-binary; keep image small
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Production default: migrate then serve. Hosts inject PORT (Railway/Render).
# Local Docker Compose overrides with --reload (see docker-compose.yml).
CMD ["sh", "-c", "alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
