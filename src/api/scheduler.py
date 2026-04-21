from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler()

def start_scheduler():
    from api.spotify import refresh_spotify_token

    if not scheduler.running:
        scheduler.add_job(
            func=refresh_spotify_token,
            trigger="interval",
            minutes=55,
            id="spotify_token_refresh",
            replace_existing=True
        )
        scheduler.start()
        print("Scheduler iniciado — token se renovará cada 55 min")