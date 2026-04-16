from __future__ import annotations

import os
import json
from dataclasses import dataclass

from dotenv import load_dotenv


load_dotenv()


def _parse_cors_origins() -> set[str]:
    raw = os.getenv("CORS_ORIGINS", "http://localhost:5173")
    return {x.strip() for x in raw.split(",") if x.strip()}


@dataclass(frozen=True)
class Settings:
    env: str = os.getenv("ENV", "local")
    log_level: str = os.getenv("LOG_LEVEL", "INFO")

    firebase_project_id: str | None = os.getenv("FIREBASE_PROJECT_ID") or None
    google_application_credentials: str | None = os.getenv("GOOGLE_APPLICATION_CREDENTIALS") or None

    if google_application_credentials is not None:
        with open(google_application_credentials) as firebase_creds:
            firebase_credentials = json.loads(firebase_creds.read())
    else:
        firebase_credentials = json.loads(os.getenv("FIREBASE_CREDENTIALS") or "{}")

    cors_origins: set[str] = _parse_cors_origins()


settings = Settings()
