from __future__ import annotations

import os
import json
from dataclasses import dataclass, field

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

    tg_bot_token: str | None = os.getenv("TG_BOT_TOKEN") or None
    tg_chat_ids: str | None = os.getenv("TG_CHAT_IDS") or None

    if google_application_credentials is not None:
        with open(google_application_credentials) as firebase_creds:
            firebase_credentials = json.loads(firebase_creds.read())
    else:
        firebase_credentials = json.loads(os.getenv("FIREBASE_CREDENTIALS") or "{}")

    cors_origins: set[str] = field(default_factory=_parse_cors_origins)


settings = Settings()
