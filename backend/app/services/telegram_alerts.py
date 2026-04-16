import requests
import os

from app.core.config import settings


def send_alert(message: str):
    url = f"https://api.telegram.org/bot{settings.tg_bot_token}/sendMessage"

    for chat_id in settings.tg_chat_ids.split(","):
        res = requests.post(url, json={
            "chat_id": chat_id,
            "text": message
        })
        print("** TG RESPOSE:", res.json())
