#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [[ ! -d "node_modules" ]]; then
  npm install
fi

if [[ ! -f ".env" && -f ".env.example" ]]; then
  cp .env.example .env
fi

MODE="${MODE:-localhost}" # localhost | exposed

if [[ "$MODE" == "exposed" ]]; then
  # Accessible on LAN (bind to all interfaces)
  exec npm run dev -- --host 0.0.0.0
fi

exec npm run dev -- --host 127.0.0.1

