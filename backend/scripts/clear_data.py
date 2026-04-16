import argparse
import requests

from app.services.firestore_http import get_access_token
from app.core.config import settings


def get_documents(collection):
    token = get_access_token()

    url = f"https://firestore.googleapis.com/v1/projects/{settings.firebase_project_id}/databases/(default)/documents/{collection}"

    res = requests.get(
        url,
        headers={"Authorization": f"Bearer {token}"}
    )

    data = res.json()
    return data.get("documents", [])


def delete_document(doc_name):
    token = get_access_token()

    url = f"https://firestore.googleapis.com/v1/{doc_name}"

    res = requests.delete(
        url,
        headers={"Authorization": f"Bearer {token}"}
    )

    return res.status_code == 200


def clear_collection(collection):
    print(f"Clearing: {collection}")

    docs = get_documents(collection)

    if not docs:
        print("No documents found")
        return

    for doc in docs:
        name = doc["name"]
        ok = delete_document(name)
        print(f"Deleted: {name.split('/')[-1]} → {ok}")

    print("Done")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Clear Firestore collections")
    parser.add_argument(
        "--collections",
        nargs="+",
        required=True,
        help="List of collection names (space separated)",
    )

    args = parser.parse_args()

    for c in args.collections:
        clear_collection(c)
