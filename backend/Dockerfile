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

# Production: migrate then serve on 8000 (match Railway Public Networking port).
# Do not rely on a random $PORT — domain target is configured as 8000.
CMD ["sh", "-c", "alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port 8000"]
