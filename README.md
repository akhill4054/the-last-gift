# the-last-gift

Monorepo with:

-   `backend/`: FastAPI API packaged for AWS Lambda (via SAM)
-   `web/`: Vite frontend hosted on Firebase Hosting

## Tech Stack

-   Backend → FastAPI + AWS Lambda (SAM)
-   Frontend → Vite (Firebase Hosting)
-   Database → Firebase Firestore

## Prerequisites

-   Python 3.11+
-   Node.js 18+
-   AWS SAM CLI
-   Firebase CLI

## Running the project

### Backend (Lambda via SAM)

#### Setup

cd backend python -m venv venv source venv/bin/activate pip install -r
requirements.txt

#### Config

-   env.json (required for SAM local)
-   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
-   FIREBASE_PROJECT_ID=your-project-id

#### Run

./run_dev.sh

#### Build

./package_lambda.sh

### Frontend

#### Setup

cd web npm install

#### Config

-   .env required

#### Run

./run_dev.sh

## Deployment

### Frontend

cd web npm run build firebase deploy

### Backend

Use package_lambda.sh and deploy via SAM / CI

## Firestore
Requires service account + project id.
