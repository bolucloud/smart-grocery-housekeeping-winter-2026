# FROM python:3.11-slim

# RUN apt-get update && \
#     apt-get install -y --no-install-recommends curl && \
#     apt-get clean && \
#     rm -rf /var/lib/apt/lists/*

# # Set environment variables
# ENV PYTHONDONTWRITEBYTECODE=1 \
#     PYTHONUNBUFFERED=1 \
#     PYTHONFAULTHANDLER=1 \
#     DATABASE_URL=


# # # Set environment variables for Poetry
# # ENV POETRY_VERSION=2.3.0
# # ENV POETRY_HOME="/opt/poetry"
# # ENV PATH="$POETRY_HOME/bin:$PATH"

# # # Install Poetry
# # RUN pip3 install "poetry==$POETRY_VERSION"

# # Create non-root user
# RUN addgroup --system --gid 1001 app && \
#     adduser --system --uid 1001 --gid 1001 --no-create-home app

# # Set working directory
# WORKDIR /app

# # Install dependencies
# RUN echo pwd
# COPY requirements.txt .
# RUN pip install --no-cache-dir --upgrade pip && \
#     pip install --no-cache-dir -r requirements.txt

# # # for poetry
# # COPY pyproject.toml poetry.lock* ./
# # RUN poetry install --no-interaction --no-ansi --no-root --only main


# # Copy application
# COPY ./app .

# # Debug . .
# RUN echo "=== Current directory contents ===" && pwd && ls -la
# RUN echo "=== Checking if main.py exists ===" && test -f main.py && echo "main.py found!" || echo "main.py NOT found!"
# RUN echo "=== Testing import ===" && python -c "import main; print('Import successful')" || echo "Import failed"
# # Change ownership

# RUN chown -R app:app /app
# #RUN chmod -R 755 /app
# # Switch to non-root user
# USER app

# # Expose port
# EXPOSE 8000

# # Health check
# HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#     CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# # Run the application
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]




FROM python:3.14

ARG DATABASE_URL

ENV DATABASE_URL="${DATABASE_URL}"


WORKDIR /code


COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install "fastapi[standard]"

COPY backend/app /code/app


CMD ["fastapi", "run", "app/main.py", "--port", "8000"]