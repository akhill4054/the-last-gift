#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [[ ! -d "venv" ]]; then
  python -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt

if [[ ! -f ".env" && -f ".env.example" ]]; then
  cp .env.example .env
fi

MODE="${MODE:-localhost}" # localhost | exposed
HOST="127.0.0.1"
if [[ "$MODE" == "exposed" ]]; then
  HOST="0.0.0.0"
fi

exec uvicorn app.main:app --reload --host "$HOST" --port 8000

