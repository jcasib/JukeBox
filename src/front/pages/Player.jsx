import { useEffect, useState } from "react"
import { fetchNowPlaying, fetchSpotifyStatus, playerPlay, playerPause, playerNext, playerPrevious, playerVolume, playerShuffle, getRole } from "../services/backEndServices"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

export const Player = () => {
    const [authorized, setAuthorized] = useState(null)
    const [loading, setLoading] = useState(true)
    const [nowPlaying, setNowPlaying] = useState(null)
    const [status, setStatus] = useState(null)
    const [volume, setVolume] = useState(50)
    const [shuffle, setShuffle] = useState(false)
    const [processingAction, setProcessingAction] = useState(null)

    useEffect(() => {
        const init = async () => {
            const role = await getRole()
            if (role !== "admin") {
                setAuthorized(false)
                setLoading(false)
                return
            }
            setAuthorized(true)
            const token = localStorage.getItem("token")
            const [np, st] = await Promise.all([
                fetchNowPlaying(),
                fetchSpotifyStatus(token)
            ])
            setNowPlaying(np)
            setStatus(st)
            setLoading(false)
        }
        init()

        const id = setInterval(async () => {
            const np = await fetchNowPlaying()
            setNowPlaying(np)
        }, 5000)

        return () => clearInterval(id)
    }, [])

    const token = localStorage.getItem("token")

    const handleAction = async (action, fn) => {
        setProcessingAction(action)
        await fn()
        setTimeout(async () => {
            const np = await fetchNowPlaying()
            setNowPlaying(np)
            setProcessingAction(null)
        }, 1000)
    }

    const handleVolume = async (e) => {
        const val = e.target.value
        setVolume(val)
        await playerVolume(val, token)
    }

    const handleShuffle = async () => {
        const newState = !shuffle
        setShuffle(newState)
        await playerShuffle(newState, token)
    }

    if (loading) return (
        <div className="text-center py-4">
            <div className="spinner-border spinner-border-sm" role="status" />
        </div>
    )

    if (!authorized) return (
        <div className="container-fluid">
            <div className="text-center py-4">
                <i className="bi bi-shield-lock fs-1" style={{ color: "var(--destructive)" }} />
                <p className="mt-2">No tienes permiso para acceder a esta página</p>
            </div>
        </div>
    )

    return (
        <div className="container-fluid">
            <div className="p-2 rounded-3 mb-3" style={{ background: "var(--card)" }}>
                <h1 className="fw-bold mb-0">Panel de Spotify</h1>
                <h6 className="mb-0">Controla la reproducción desde aquí</h6>
            </div>

            {/* Estado de conexión */}
            <div className="mod-card mb-3">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <div className="fw-bold">Estado de conexión</div>
                        {status?.connected && (
                            <div style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                                Actualizado: {new Date(status.updated_at).toLocaleString()}
                            </div>
                        )}
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <span style={{
                            width: "10px", height: "10px", borderRadius: "50%",
                            background: status?.connected ? "var(--success)" : "var(--destructive)",
                            display: "inline-block"
                        }} />
                        <span style={{ fontSize: "13px" }}>
                            {status?.connected ? "Conectado" : "Desconectado"}
                        </span>
                    </div>
                </div>
                {!status?.connected && (
                    <a
                        href={`${BACKEND_URL}/api/spotify/login`}
                        className="btn primary-bottom w-100 mt-2"
                    >
                        <i className="bi bi-spotify me-2" />Conectar Spotify
                    </a>
                )}
            </div>

            {/* Reproductor */}
            <div className="mod-card mb-3">
                {nowPlaying?.playing ? (
                    <div className="d-flex align-items-center gap-3 mb-3">
                        <img
                            src={nowPlaying.album_image}
                            alt="cover"
                            style={{ width: "64px", height: "64px", borderRadius: "8px", objectFit: "cover" }}
                        />
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: "700", fontSize: "15px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {nowPlaying.track_name}
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                                {nowPlaying.artist_name}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center mb-3" style={{ color: "var(--muted-foreground)" }}>
                        <i className="bi bi-music-note fs-1" />
                        <p className="mt-2 mb-0">No hay nada sonando en este momento</p>
                    </div>
                )}

                {/* Controles — siempre visibles */}
                <div className="d-flex justify-content-center align-items-center gap-4 mb-3">
                    <button
                        className="btn"
                        style={{ color: shuffle ? "var(--primary)" : "var(--muted-foreground)", fontSize: "20px" }}
                        onClick={handleShuffle}
                    >
                        <i className="bi bi-shuffle" />
                    </button>
                    <button
                        className="btn"
                        style={{ color: "var(--foreground)", fontSize: "24px" }}
                        onClick={() => handleAction("previous", () => playerPrevious(token))}
                        disabled={processingAction === "previous"}
                    >
                        {processingAction === "previous"
                            ? <div className="spinner-border spinner-border-sm" role="status" />
                            : <i className="bi bi-skip-start-fill" />
                        }
                    </button>
                    <button
                        className="btn"
                        style={{ background: "var(--primary)", color: "var(--primary-foreground)", borderRadius: "50%", width: "52px", height: "52px", fontSize: "22px" }}
                        onClick={() => handleAction("play", () => nowPlaying?.playing ? playerPause(token) : playerPlay(token))}
                        disabled={processingAction === "play"}
                    >
                        {processingAction === "play"
                            ? <div className="spinner-border spinner-border-sm" role="status" />
                            : <i className={`bi ${nowPlaying?.playing ? "bi-pause-fill" : "bi-play-fill"}`} />
                        }
                    </button>
                    <button
                        className="btn"
                        style={{ color: "var(--foreground)", fontSize: "24px" }}
                        onClick={() => handleAction("next", () => playerNext(token))}
                        disabled={processingAction === "next"}
                    >
                        {processingAction === "next"
                            ? <div className="spinner-border spinner-border-sm" role="status" />
                            : <i className="bi bi-skip-end-fill" />
                        }
                    </button>
                </div>

                {/* Volumen */}
                <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-volume-down" style={{ color: "var(--muted-foreground)" }} />
                    <input
                        type="range"
                        className="form-range flex-fill"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={handleVolume}
                    />
                    <i className="bi bi-volume-up" style={{ color: "var(--muted-foreground)" }} />
                </div>
            </div>
        </div>
    )
}