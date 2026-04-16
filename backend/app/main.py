from __future__ import annotations

from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.core.config import settings
from app.services.firestore_http import create_booked_slot, get_status_state, reset_latest_booked_slot


class BookSlotBody(BaseModel):
    schedule_at: datetime = Field(
        ...,
        description="UTC instant when the slot is scheduled (ISO 8601). Naive values are interpreted as UTC.",
    )


def create_app() -> FastAPI:
    app = FastAPI(title="Backend API", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(settings.cors_origins),
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/healthz")
    def healthz() -> dict[str, object]:
        return {"ok": True, "service": "backend", "env": settings.env}

    @app.get("/api/status")
    def status_api() -> dict[str, object]:
        state = get_status_state()
        return {
            "ok": True,
            "status": state["status"],
            "data": state["data"],
            "now": datetime.now(timezone.utc).isoformat(),
        }

    @app.post("/api/book-slot")
    def book_slot(body: BookSlotBody) -> dict[str, object]:
        if body.schedule_at.tzinfo is None:
            scheduled_utc = body.schedule_at.replace(tzinfo=timezone.utc)
        else:
            scheduled_utc = body.schedule_at.astimezone(timezone.utc)

        now_utc = datetime.now(timezone.utc)
        if scheduled_utc <= now_utc:
            raise HTTPException(
                status_code=400,
                detail="schedule_at must be a future instant in UTC",
            )

        row, err = create_booked_slot(scheduled_utc)
        if err:
            raise HTTPException(status_code=503, detail=err)

        return {
            "ok": True,
            "id": row["id"],
            "scheduled_at": row["scheduled_at"],
            "created_at_utc": row["created_at_utc"],
            "last_modified_at_utc": row["last_modified_at_utc"],
        }

    @app.post("/api/reset-slot")
    def reset_slot() -> dict[str, object]:
        row, err = reset_latest_booked_slot()
        if err:
            raise HTTPException(status_code=503, detail=err)
        return {"ok": True, "data": row}

    return app


app = create_app()
