from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Enum, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum
from datetime import datetime, timezone
from typing import List
from flask_bcrypt import generate_password_hash, check_password_hash

db = SQLAlchemy()


class Roles(enum.Enum):
    USER = "user"
    MOD = "mod"
    ADMIN = "admin"


class SongStatus(enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(nullable=False)
    username: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    role: Mapped[Roles] = mapped_column(
        Enum(Roles, name="roles"), default=Roles.USER)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    muted_until: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=True, default=None)

    song_requests: Mapped[List["SongRequest"]] = relationship(
        "SongRequest", back_populates="user", cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "username": self.username,
            "role": self.role.value,
            "song_requests": [
                {
                    "id": song.id,
                    "track_name": song.track_name,
                    "artist_name": song.artist_name,
                    "album_image": song.album_image,
                    "status": song.status.value
                }
                for song in self.song_requests
            ],
            "muted_until": self.muted_until.isoformat() if self.muted_until else None
            # do not serialize the password, its a security breach
        }


class SongRequest(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    track_id: Mapped[str] = mapped_column(String(100), nullable=False)
    track_uri: Mapped[str] = mapped_column(String(200), nullable=False)
    track_name: Mapped[str] = mapped_column(String(200), nullable=False)
    artist_name: Mapped[str] = mapped_column(String(200), nullable=False)
    album_image: Mapped[str] = mapped_column(String(500), nullable=False)
    status: Mapped[SongStatus] = mapped_column(
        Enum(SongStatus, name="song_status"), default=SongStatus.PENDING)
    reject_message: Mapped[str] = mapped_column(String(300), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(
        timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user: Mapped["User"] = relationship("User", back_populates="song_requests")

    def serialize(self):
        return {
            "id": self.id,
            "track_id": self.track_id,
            "track_uri": self.track_uri,
            "track_name": self.track_name,
            "artist_name": self.artist_name,
            "album_image": self.album_image,
            "status": self.status.value,
            "reject_message": self.reject_message,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "user_id": self.user_id,
            "username": self.user.username if self.user else None
        }


class SpotifyToken(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    access_token: Mapped[str] = mapped_column(String(500), nullable=False)
    refresh_token: Mapped[str] = mapped_column(String(500), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=True)

    def serialize(self):
        return {
            "id": self.id,
            "updated_at": self.updated_at.isoformat(),
            "expires_at": self.expires_at.isoformat()
        }


class RecentlyPlayed(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    track_id: Mapped[str] = mapped_column(String(100), nullable=False)
    track_name: Mapped[str] = mapped_column(String(200), nullable=False)
    artist_name: Mapped[str] = mapped_column(String(200), nullable=False)
    album_image: Mapped[str] = mapped_column(String(500), nullable=True)
    played_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    def serialize(self):
        return {
            "track_id": self.track_id,
            "track_name": self.track_name,
            "artist_name": self.artist_name,
            "album_image": self.album_image,
            "played_at": self.played_at.isoformat()
        }
