# backend

## Endpoints

- `GET /healthz`
- `GET /api/test`

## Local dev (reload)

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

## Run like Firebase Functions (locally)

```bash
pip install -r requirements.txt
functions-framework --target=api --port=8080
```

## Deploy

From repo root:

```bash
firebase deploy --only functions
```

