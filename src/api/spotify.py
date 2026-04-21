import os
import requests
from datetime import datetime, timezone, timedelta

SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"

def refresh_spotify_token():
    from api.models import db, SpotifyToken

    record = SpotifyToken.query.first()
    if not record:
        return None
    response = requests.post(SPOTIFY_TOKEN_URL, data={
        "grant_type": "refresh_token",
        "refresh_token": record.refresh_token,
        "client_id": SPOTIFY_CLIENT_ID,
        "client_secret": SPOTIFY_CLIENT_SECRET
    })
    new_token = response.json().get("access_token")
    if new_token:
        record.access_token = new_token
        record.updated_at = datetime.now(timezone.utc)
        record.expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
        db.session.commit()
        return new_token
    
def get_spotify_token():
    from api.models import SpotifyToken
    record = SpotifyToken.query.first()
    if not record:
        return None
    return record.access_token