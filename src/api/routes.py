"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint, redirect
from api.models import db, User, SongRequest, SongStatus, Roles, SpotifyToken, RecentlyPlayed
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError
import os
import re
import requests
from api.spotify import get_spotify_token
from datetime import datetime, timezone, timedelta
from api.extensions import limiter

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api, resources={r"/api/*": {"origins": "*"}})

# — Config ———————————————————————————————————————————————————————————————

SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
SPOTIFY_REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI")
FRONTEND_URL = os.getenv("FRONTEND_URL")
SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize"
SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"
SPOTIFY_API_URL = "https://api.spotify.com/v1"

# — Auth ——————————————————————————————————————————————————————————————————

@api.route('/signup', methods=['POST'])
@limiter.limit("3 per minute")
def signup():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid application"}), 400

    email = data.get('email', '').lower().strip()
    password = data.get('password')
    username = data.get('username', '').strip()

    if not email or not password or not username:
        return jsonify({"error": "Email, password, and username are required"}), 400

    email_regex = r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    if not re.match(email_regex, email):
        return jsonify({"error": "Invalid email"}), 400

    if len(password) < 6:
        return jsonify({"error": "The password must be at least 6 characters long"}), 400

    password_regex = r'^(?=.*[A-Za-z])(?=.*\d).+$'
    if not re.match(password_regex, password):
        return jsonify({"error": "The password must contain at least one letter and one number"}), 400

    new_user = User(email=email, username=username)
    new_user.set_password(password)

    try:
        db.session.add(new_user)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Email or username already in use"}), 400

    return jsonify({"msg": "Successful registration"}), 201


@api.route('/login', methods=['POST'])
@limiter.limit("5 per minute; 20 per hour")
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid application"}), 400

    email = data.get('email', '').lower().strip()
    password = (data.get('password') or '').strip()

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = db.session.execute(
        db.select(User).where(User.email == email)
    ).scalar_one_or_none()

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(identity=str(
        user.id), expires_delta=timedelta(hours=6))

    return jsonify({
        "msg": "Login correcto",
        "token": access_token,
        "user": user.serialize()
    }), 200


@api.route('/get_user', methods=['GET'])
@jwt_required()
def get_user():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.serialize()), 200

# — Spotify Search ————————————————————————————————————————————————————————


@api.route('/spotify/search', methods=['GET'])
@jwt_required()
def spotify_search():
    q = request.args.get("q", "")
    limit = int(request.args.get("limit", 10))
    token = get_spotify_token()
    if not token:
        return jsonify({"error": "Spotify no conected"}), 503
    response = requests.get(f"{SPOTIFY_API_URL}/search", headers={
        "Authorization": f"Bearer {token}"
    }, params={"q": q, "type": "track", "limit": limit})
    return jsonify(response.json())

# — Song Requests ————————————————————————————————————————————————————————


@api.route('/requests', methods=['POST'])
@jwt_required()
@limiter.limit("5 per minute; 20 per hour")
def create_request():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)

    body = request.get_json() or {}
    song_request = SongRequest(
        user_id=user_id,
        track_id=body.get("track_id"),
        track_uri=body.get("track_uri"),
        track_name=body.get("track_name"),
        artist_name=body.get("artist_name"),
        album_image=body.get("album_image"),
        status=SongStatus.PENDING
    )

    db.session.add(song_request)
    db.session.commit()

    return jsonify(song_request.serialize()), 201


@api.route('/requests/my', methods=['GET'])
@jwt_required()
def my_requests():
    user_id = int(get_jwt_identity())
    song_requests = SongRequest.query.filter_by(user_id=user_id).order_by(
        SongRequest.created_at.desc()).all()
    return jsonify([r.serialize() for r in song_requests]), 200


@api.route('/requests/<int:req_id>', methods=['DELETE'])
@jwt_required()
def delete_request(req_id):
    user_id = int(get_jwt_identity())
    song_request = db.session.get(SongRequest, req_id)
    if not song_request or song_request.user_id != user_id:
        return jsonify({"error": "Request not found"}), 404
    if song_request.status != SongStatus.PENDING:
        return jsonify({"error": "Only pending requests can be deleted"}), 400

    db.session.delete(song_request)
    db.session.commit()
    return jsonify({"msg": "Request successfully deleted"}), 200

# — MOD ————————————————————————————————————————————————————————————————————


def require_mod():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user or user.role not in (Roles.MOD.value, Roles.ADMIN.value):
        return None, (jsonify({"error": "Access denied"}), 403)
    return user, None


@api.route('/moderator/requests', methods=['GET'])
@jwt_required()
def get_pending_requests():
    user, error = require_mod()
    if error:
        return error

    song_requests = SongRequest.query.filter_by(
        status=SongStatus.PENDING).order_by(SongRequest.created_at.asc()).all()
    return jsonify([r.serialize() for r in song_requests]), 200


@api.route('/moderator/requests/<int:req_id>/accept', methods=['PUT'])
@jwt_required()
def accept_request(req_id):
    user, error = require_mod()
    if error:
        return error

    song_request = db.session.get(SongRequest, req_id)
    if not song_request:
        return jsonify({"error": "Request not found"}), 404

    token = get_spotify_token()
    if token:
        requests.post(f"{SPOTIFY_API_URL}/me/player/queue", headers={
            "Authorization": f"Bearer {token}"
        }, params={"uri": song_request.track_uri})

    song_request.status = SongStatus.ACCEPTED
    song_request.updated_at = datetime.now(timezone.utc)
    db.session.commit()

    return jsonify(song_request.serialize()), 200


@api.route('/moderator/requests/<int:req_id>/reject', methods=['PUT'])
@jwt_required()
def reject_request(req_id):
    user, error = require_mod()
    if error:
        return error

    body = request.get_json() or {}
    song_request = db.session.get(SongRequest, req_id)
    if not song_request:
        return jsonify({"error": "Request not found"}), 404

    song_request.status = SongStatus.REJECTED
    song_request.reject_message = body.get("message", "")
    song_request.updated_at = datetime.now(timezone.utc)
    db.session.commit()

    return jsonify(song_request.serialize()), 200

# — Spotify Playing ———————————————————————————————————————————————————————


@api.route('/public/now-playing', methods=['GET'])
def now_playing():
    token = get_spotify_token()
    if not token:
        return jsonify({"playing": False, "error": "Spotify not connected"}), 503

    response = requests.get(f"{SPOTIFY_API_URL}/me/player/currently-playing", headers={
        "Authorization": f"Bearer {token}"
    })

    if response.status_code == 204 or not response.content:
        return jsonify({"playing": False})

    data = response.json()
    track = data.get("item")
    if not track:
        return jsonify({"playing": False})

    return jsonify({
        "playing": data.get("is_playing", False),
        "track_name": track.get("name"),
        "artist_name": ", ".join(a["name"] for a in track.get("artists", [])),
        "album_image": track["album"]["images"][0]["url"] if track.get("album", {}).get("images") else None,
        "progress_ms": data.get("progress_ms", 0),
        "duration_ms": track.get("duration_ms", 0),
    })


@api.route('/public/spotify-queue', methods=['GET'])
def spotify_queue():
    token = get_spotify_token()
    if not token:
        return jsonify({"queue": []}), 503

    response = requests.get(f"{SPOTIFY_API_URL}/me/player/queue", headers={
        "Authorization": f"Bearer {token}"
    })

    if response.status_code != 200:
        return jsonify({"queue": []})

    data = response.json()
    queue = []
    for track in data.get("queue", [])[:20]:
        queue.append({
            "track_name": track.get("name"),
            "artist_name": ", ".join(a["name"] for a in track.get("artists", [])),
            "album_image": track["album"]["images"][1]["url"] if track.get("album", {}).get("images") else None,
        })

    return jsonify({"queue": queue})

@api.route('/public/recently-played', methods=['GET'])
def recently_played():
    tracks = RecentlyPlayed.query.order_by(RecentlyPlayed.played_at.desc()).limit(20).all()
    return jsonify({"tracks": [t.serialize() for t in tracks]})

@api.route('/public/top-tracks', methods=['GET'])
def top_tracks():
    token = get_spotify_token()
    if not token:
        return jsonify({"error": "Spotify not connected"}), 503

    time_range = request.args.get("time_range", "medium_term")
    limit = int(request.args.get("limit", 10))

    response = requests.get(f"{SPOTIFY_API_URL}/me/top/tracks", headers={
        "Authorization": f"Bearer {token}"
    }, params={"time_range": time_range, "limit": limit})

    return jsonify(response.json())

@api.route('/public/top-artists', methods=['GET'])
def top_artists():
    token = get_spotify_token()
    if not token:
        return jsonify({"error": "Spotify not connected"}), 503

    time_range = request.args.get("time_range", "medium_term")
    limit = int(request.args.get("limit", 10))

    response = requests.get(f"{SPOTIFY_API_URL}/me/top/artists", headers={
        "Authorization": f"Bearer {token}"
    }, params={"time_range": time_range, "limit": limit})

    return jsonify(response.json())

@api.route('/spotify/autocomplete', methods=['GET'])
def spotify_autocomplete():
    q = request.args.get("q", "").strip()
    if len(q) < 2:
        return jsonify([])
    
    token = get_spotify_token()
    if not token:
        return jsonify([]), 503

    response = requests.get(f"{SPOTIFY_API_URL}/search", headers={
        "Authorization": f"Bearer {token}"
    }, params={"q": q, "type": "track,artist", "limit": 5})

    data = response.json()
    suggestions = []

    for track in data.get("tracks", {}).get("items", []):
        suggestions.append({
            "type": "track",
            "label": f"{track['name']} — {track['artists'][0]['name']}",
            "query": track["name"]
        })

    for artist in data.get("artists", {}).get("items", []):
        suggestions.append({
            "type": "artist",
            "label": artist["name"],
            "query": artist["name"]
        })

    return jsonify(suggestions[:6])


# — ADMIN ————————————————————————————————————————————————————————————————————


def require_admin():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user or user.role != Roles.ADMIN.value:
        return None, (jsonify({"error": "Access denied"}), 403)
    return user, None


@api.route('/spotify/login', methods=['GET'])
def spotify_login():
    scope = " ".join([
        "user-read-private",
        "user-read-playback-state",
        "user-modify-playback-state",
        "user-read-currently-playing",
        "user-top-read",
        "user-read-recently-played"
    ])
    params = {
        "client_id": SPOTIFY_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": SPOTIFY_REDIRECT_URI,
        "scope": scope,
    }
    auth_url = requests.Request(
        'GET', SPOTIFY_AUTH_URL, params=params).prepare().url
    return redirect(auth_url)


@api.route('/callback', methods=['GET'])
def spotify_callback():
    code = request.args.get("code")
    if not code:
        return jsonify({"error": "No code received"}), 400

    response = requests.post(SPOTIFY_TOKEN_URL, data={
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": SPOTIFY_REDIRECT_URI,
        "client_id": SPOTIFY_CLIENT_ID,
        "client_secret": SPOTIFY_CLIENT_SECRET
    })

    tokens = response.json()

    record = SpotifyToken.query.first()
    if record:
        record.access_token = tokens.get("access_token")
        record.refresh_token = tokens.get("refresh_token")
        record.update_at = datetime.now(timezone.utc)
    else:
        record = SpotifyToken(
            access_token=tokens.get("access_token"),
            refresh_token=tokens.get("refresh_token")
        )
        db.session.add(record)
    db.session.commit()
    return redirect(f"{FRONTEND_URL}/admin?spotify=connected")


@api.route('/admin/users', methods=['GET'])
@jwt_required()
def list_users():
    user, error = require_admin()
    if error:
        return error
    users = User.query.all()
    return jsonify([u.serialize() for u in users]), 200


@api.route('/admin/users/<int:target_id>/role', methods=['PUT'])
@jwt_required()
def set_role(target_id):
    user, error = require_admin()
    if error:
        return error

    body = request.get_json()
    role_str = body.get("role")

    try:
        new_role = Roles(role_str)
    except ValueError:
        return jsonify({"error": "Invalid role"}), 400

    target = db.session.get(User, target_id)
    if not target:
        return jsonify({"error": "User not found"}), 404

    target.role = new_role.value
    db.session.commit()
    return jsonify(target.serialize()), 200