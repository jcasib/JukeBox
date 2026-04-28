from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler()

_last_track_id = None


def refresh_spotify_token_job(app):
    with app.app_context():
        from api.spotify import refresh_spotify_token
        refresh_spotify_token()


def track_now_playing(app):
    global _last_track_id
    with app.app_context():
        from api.models import db, RecentlyPlayed
        from api.spotify import get_spotify_token
        import requests
        from datetime import datetime, timezone

        token = get_spotify_token()
        if not token:
            return

        response = requests.get(
            "https://api.spotify.com/v1/me/player/currently-playing",
            headers={"Authorization": f"Bearer {token}"}
        )

        if response.status_code == 204 or not response.content:
            return

        data = response.json()
        track = data.get("item")

        if not track or not data.get("is_playing"):
            return

        track_id = track.get("id")

        if track_id == _last_track_id:
            return

        _last_track_id = track_id

        new_entry = RecentlyPlayed(
            track_id=track_id,
            track_name=track.get("name"),
            artist_name=", ".join(a["name"] for a in track.get("artists", [])),
            album_image=track["album"]["images"][0]["url"] if track.get(
                "album", {}).get("images") else None,
            played_at=datetime.now(timezone.utc)
        )

        db.session.add(new_entry)
        db.session.flush()

        total = db.session.query(RecentlyPlayed).count()
        if total > 20:
            oldest = db.session.query(RecentlyPlayed).order_by(
                RecentlyPlayed.played_at.asc()).limit(total - 20).all()
            for entry in oldest:
                db.session.delete(entry)

        db.session.commit()
        print(f"🎵 Nueva canción guardada: {new_entry.track_name}")


def clear_old_requests(app):
    with app.app_context():
        from api.models import db, SongRequest
        deleted = db.session.query(SongRequest).delete()
        db.session.commit()
        print(f"🗑️ {deleted} peticiones eliminadas")


def start_scheduler(app):
    import os
    if os.environ.get('FLASK_ENV') == 'development' and os.environ.get('WERKZEUG_RUN_MAIN') != 'true':
        return
    if not scheduler.running:
        scheduler.add_job(
            func=refresh_spotify_token_job,
            args=[app],
            trigger="interval",
            minutes=55,
            id="spotify_token_refresh",
            replace_existing=True
        )
        scheduler.add_job(
            func=track_now_playing,
            args=[app],
            trigger="interval",
            seconds=15,
            id="track_now_playing",
            replace_existing=True
        )
        scheduler.add_job(
            func=clear_old_requests,
            args=[app],
            trigger="cron",
            hour=10,
            minute=0,
            id="clear_old_requests",
            replace_existing=True
        )
        scheduler.start()
        print("Scheduler iniciado — token se renovará cada 55 min")
