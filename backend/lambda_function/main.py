from datetime import datetime, timezone
import json

from app.core.config import settings
from app.services.firestore_http import (
    create_booked_slot,
    get_status_state,
    reset_latest_booked_slot,
)


def get_cors_origin(event):
    headers = event.get("headers") or {}
    origin = headers.get("origin") or headers.get("Origin")

    if origin in settings.cors_origins:
        return origin

    return None


def response(event, status, body):
    return {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": get_cors_origin(event),
        },
        "body": json.dumps(body),
    }


def parse_datetime(value: str) -> datetime:
    try:
        dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            return dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except Exception:
        raise ValueError("Invalid datetime format")


def handler(event, context):
    method = event.get("requestContext", {}).get("http", {}).get("method")
    path = event.get("rawPath")

    try:
        # Handle preflight
        if method == "OPTIONS":
            return {
                "statusCode": 200,
                "headers": {
                    "Access-Control-Allow-Origin": get_cors_origin(event),
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
                },
                "body": ""
            }

        # HEALTH
        if method == "GET" and path == "/healthz":
            return response(event, 200, {
                "ok": True,
                "service": "backend",
                "env": settings.env,
            })

        # STATUS
        if method == "GET" and path == "/api/status":
            state = get_status_state()
            return response(event, 200, {
                "ok": True,
                "status": state["status"],
                "data": state["data"],
                "now": datetime.now(timezone.utc).isoformat(),
            })

        # BOOK SLOT
        if method == "POST" and path == "/api/book-slot":
            body = json.loads(event.get("body") or "{}")
            schedule_at = body.get("schedule_at")

            if not schedule_at:
                return response(event, 400, {"error": "schedule_at is required"})

            try:
                scheduled_utc = parse_datetime(schedule_at)
            except ValueError as e:
                return response(event, 400, {"error": str(e)})

            now_utc = datetime.now(timezone.utc)
            if scheduled_utc <= now_utc:
                return response(event, 400, {
                    "error": "schedule_at must be a future instant in UTC"
                })

            row, err = create_booked_slot(scheduled_utc)
            if err:
                return response(event, 503, {"error": err})

            return response(event, 200, {
                "ok": True,
                "id": row["id"],
                "scheduled_at": row["scheduled_at"],
                "created_at_utc": row["created_at_utc"],
                "last_modified_at_utc": row["last_modified_at_utc"],
            })

        # RESET SLOT
        if method == "POST" and path == "/api/reset-slot":
            row, err = reset_latest_booked_slot()
            if err:
                return response(event, 503, {"error": err})

            return response(event, 200, {
                "ok": True,
                "data": row
            })

        # NOT FOUND
        return response(event, 404, {"error": "Not found"})

    except Exception as e:
        return response(event, 500, {"error": str(e)})
