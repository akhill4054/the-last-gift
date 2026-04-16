# the-last-gift

Monorepo with:

- `backend/`: FastAPI API designed to run locally (Uvicorn reload) and deploy on **Firebase Functions** (Python, via Functions Framework).
- `web/`: frontend (Vite) with hot reload.

## Prereqs

- Python 3.11+ recommended
- Node 18+ recommended
- Firebase CLI (`firebase --version`)

## Backend

### Local dev (auto-reload)

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Open:

- `http://localhost:8000/healthz`
- `http://localhost:8000/api/test`

### Firebase Functions (local)

```bash
cd backend
pip install -r requirements.txt
functions-framework --target=api --port=8080
```

Then hit:

- `http://localhost:8080/healthz`

### Firestore / Firebase Admin

For local + deploy, configure one of:

- `GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json`
- or runtime-provided credentials on GCP/Firebase

And set:

- `FIREBASE_PROJECT_ID=your-project-id`

If Firestore isn’t configured, `/api/test` still works but will skip Firestore calls.

## Frontend

```bash
cd web
npm install
npm run dev
```

## Firebase deploy files

- Root `firebase.json` points Functions source to `backend/`.
- Root `.firebaserc` stores the project id (set yours).

