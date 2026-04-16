import requests
import time
from datetime import datetime, timezone, timedelta

import google.auth.transport.requests
from google.oauth2 import service_account

from app.core.config import settings


TOKEN_URL = "https://oauth2.googleapis.com/token"

TOKEN_CACHE = {
    "access_token": None,
    "expires_at": 0,
}

SCOPES = ["https://www.googleapis.com/auth/datastore"]


def get_access_token():
    now = int(time.time())

    # Reuse if still valid (add buffer of 60s)
    if TOKEN_CACHE["access_token"] and now < TOKEN_CACHE["expires_at"] - 60:
        return TOKEN_CACHE["access_token"]

    creds_info = settings.firebase_credentials

    credentials = service_account.Credentials.from_service_account_info(
        creds_info,
        scopes=SCOPES,
    )

    request = google.auth.transport.requests.Request()
    credentials.refresh(request)

    token = credentials.token

    TOKEN_CACHE["access_token"] = token
    TOKEN_CACHE["expires_at"] = now + 60

    return token


def get_status_state():
    token = get_access_token()

    url = f"https://firestore.googleapis.com/v1/projects/{settings.firebase_project_id}/databases/(default)/documents:runQuery"

    query = {
        "structuredQuery": {
            "from": [{"collectionId": "booked-slots"}],
            "orderBy": [
                {"field": {"fieldPath": "created_at_utc"}, "direction": "DESCENDING"}
            ],
            "limit": 1,
        }
    }

    res = requests.post(
        url,
        headers={"Authorization": f"Bearer {token}"},
        json=query,
    )

    docs = res.json()

    if not docs or "document" not in docs[0]:
        return {"status": "new", "data": None}

    fields = docs[0]["document"]["fields"]

    if fields.get("is_deleted", {}).get("booleanValue") is True:
        return {"status": "new", "data": None}

    scheduled_at = fields["scheduled_at"]["timestampValue"]

    now = datetime.now(timezone.utc)

    scheduled_dt = datetime.fromisoformat(scheduled_at.replace("Z", "+00:00"))

    if now < scheduled_dt - timedelta(hours=12):
        return {"status": "slot_selected", "data": {"scheduled_at": scheduled_at}}

    # fetch revealed location similarly
    query = {
        "structuredQuery": {
            "from": [{"collectionId": "revealed-locations"}],
            "orderBy": [
                {"field": {"fieldPath": "created_at_utc"}, "direction": "DESCENDING"}
            ],
            "limit": 1,
        }
    }

    res = requests.post(
        url,
        headers={"Authorization": f"Bearer {token}"},
        json=query,
    )

    docs = res.json()

    location = None
    if docs and "document" in docs[0]:
        fields = docs[0]["document"]["fields"]

        location = {
            "lat": fields["lat"]["stringValue"],
            "long": fields["long"]["stringValue"],
            "image": fields["image"]["stringValue"],
            "hint": fields["hint"]["stringValue"],
        }

    return {"status": "location", "data": {"location": location}}  # implement same way


def create_booked_slot(scheduled_at):
    token = get_access_token()

    url = f"https://firestore.googleapis.com/v1/projects/{settings.firebase_project_id}/databases/(default)/documents/booked-slots"

    now = datetime.now(timezone.utc).isoformat()

    body = {
        "fields": {
            "scheduled_at": {"timestampValue": scheduled_at.isoformat()},
            "created_at_utc": {"timestampValue": now},
            "last_modified_at_utc": {"timestampValue": now},
            "is_deleted": {"booleanValue": False},
        }
    }

    res = requests.post(
        url,
        headers={"Authorization": f"Bearer {token}"},
        json=body,
    )

    data = res.json()

    return {
        "id": data["name"].split("/")[-1],
        "scheduled_at": scheduled_at.isoformat(),
        "created_at_utc": now,
        "last_modified_at_utc": now,
    }, None


def reset_latest_booked_slot():
    try:
        token = get_access_token()

        base = f"https://firestore.googleapis.com/v1/projects/{settings.firebase_project_id}/databases/(default)/documents"

        # Step 1 — get latest booked slot
        query_url = f"{base}:runQuery"

        query = {
            "structuredQuery": {
                "from": [{"collectionId": "booked-slots"}],
                "orderBy": [
                    {
                        "field": {"fieldPath": "created_at_utc"},
                        "direction": "DESCENDING",
                    }
                ],
                "limit": 1,
            }
        }

        res = requests.post(
            query_url,
            headers={"Authorization": f"Bearer {token}"},
            json=query,
        )

        docs = res.json()

        if not docs or "document" not in docs[0]:
            return {"updated": False, "reason": "no_booked_slot"}, None

        doc = docs[0]["document"]
        doc_name = doc["name"]  # full path
        doc_id = doc_name.split("/")[-1]

        # Step 2 — update document
        now = datetime.now(timezone.utc).isoformat()

        update_url = f"https://firestore.googleapis.com/v1/{doc_name}?updateMask.fieldPaths=is_deleted&updateMask.fieldPaths=last_modified_at_utc"

        body = {
            "fields": {
                "is_deleted": {"booleanValue": True},
                "last_modified_at_utc": {"timestampValue": now},
            }
        }

        update_res = requests.patch(
            update_url,
            headers={"Authorization": f"Bearer {token}"},
            json=body,
        )

        if update_res.status_code != 200:
            return None, update_res.text

        return {
            "updated": True,
            "id": doc_id,
            "last_modified_at_utc": now,
        }, None

    except Exception as e:
        return None, str(e)
