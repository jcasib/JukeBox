import { useEffect, useState } from "react"
import { fetchTopArtists, fetchTopTracks, searchTracks, createRequest, fetchMyRequests, fetchRecentlyPlayed, fetchSpotifyQueue } from "../services/backEndServices"

export const Search = () => {

    const [query, setQuery] = useState("")
    const [loading, setLoading] = useState(false)
    const [feedback, setFeedback] = useState(null)

    const [requestingId, setRequestingId] = useState(null)
    const [requestedIds, setRequestedIds] = useState([])

    const [results, setResults] = useState([])
    const [searching, setSearching] = useState(false)
    const [topTracks, setTopTracks] = useState([]);
    const [topArtists, setTopArtists] = useState([]);
    const [topsLoading, setTopsLoading] = useState(true);

    const [queue, setQueue] = useState([])
    const [recentlyPlayed, setRecentlyPlayed] = useState([])
    const [alertModal, setAlertModal] = useState(null)

    const handleRequest = async (track) => {
        const token = localStorage.getItem("token")
        if (!token) return

        if (queue.some(q => q.track_name === track.name)) {
            setAlertModal({ msg: "Esta canción ya está en la cola", icon: "bi-collection-play" })
            return
        }
        if (recentlyPlayed.some(r => r.track_id === track.id)) {
            setAlertModal({ msg: "Esta canción ha sonado recientemente", icon: "bi-clock-history" })
            return
        }

        setRequestingId(track.id)
        const result = await createRequest(track, token)

        if (result?.error === "muted") {
            const until = new Date(result.muted_until)
            const diff = Math.ceil((until - new Date()) / 60000)
            const hours = Math.floor(diff / 60)
            const mins = diff % 60
            let timeMsg
            if (diff < 60) {
                timeMsg = diff === 1 ? "1 minuto" : `${diff} minutos`
            } else if (mins === 0) {
                timeMsg = hours === 1 ? "1 hora" : `${hours} horas`
            } else {
                timeMsg = `${hours}h ${mins}min`
            }
            setAlertModal({
                msg: `Peticiones desactivadas temporalmente para ti`,
                submsg: `Vuelve a intentarlo en ${timeMsg}`,
                icon: "bi-person-slash"
            })
            setRequestingId(null)
            return
        }

        if (result?.error === "rate_limit") {
            setAlertModal({ msg: "Has hecho demasiadas peticiones, espera un momento", icon: "bi-exclamation-circle" })
            setRequestingId(null)
            return
        }

        setRequestedIds(prev => [...prev, track.id])
        setRequestingId(null)
    }

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) return
        fetchMyRequests(token).then(data => {
            if (!Array.isArray(data)) return
            const ids = data
                .filter(r => r.status === "pending")
                .map(r => r.track_id)
            setRequestedIds(ids)
        })
    }, [])

    useEffect(() => {
        const loadTops = async () => {
            setTopsLoading(true)
            const [tracks, artists, qData, recentData] = await Promise.all([
                fetchTopTracks("medium_term"),
                fetchTopArtists("medium_term"),
                fetchSpotifyQueue(),
                fetchRecentlyPlayed(20)
            ])
            setTopTracks(tracks?.items || [])
            setTopArtists(artists?.items || [])
            setQueue(qData?.queue || [])
            setRecentlyPlayed(recentData?.tracks || [])
            setTopsLoading(false)
        }
        loadTops()
    }, [])

    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([])
            return
        }
        const token = localStorage.getItem("token")
        const delay = setTimeout(async () => {
            setSearching(true)
            const data = await searchTracks(query, token)
            setResults(data?.tracks?.items || [])
            setSearching(false)
        }, 400)

        return () => clearTimeout(delay)
    }, [query])

    return (
        <div className="container-fluid">
            <div className="position-relative mb-3 border rounded-pill px-3">
                <form className="d-flex gap-2 align-items-center">
                    <i className="bi bi-search fs-6"></i>
                    <input
                        id="searchBar"
                        type="text"
                        className="form-control bg-transparent shadow-none p-2"
                        placeholder="Busca canciones o artistas..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    ></input>
                </form>
            </div>
            <div className="mb-3 px-1" style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
                <i className="bi bi-info-circle me-1" />
                Puedes pedir un máximo de 30 canciones por hora
            </div>

            {query.trim().length >= 2 && (
                <div className="mb-4">
                    {searching ? (
                        <div className="text-center py-3">
                            <div className="spinner-border spinner-border-sm" role="status" />
                        </div>
                    ) : results.length === 0 ? (
                        <div className="text-center text-muted py-3">Sin resultados</div>
                    ) : (
                        results.map((track, index) => (
                            <div id="topSong-card" className="mb-1" key={index}>
                                <img
                                    id="topSongCover"
                                    src={track.album?.images?.[2]?.url || track.album?.images?.[0]?.url}
                                    alt={track.name}
                                />
                                <div id="topSongTrackInfo">
                                    <div id="topSongTrackTitle">{track.name}</div>
                                    <div id="topSongTrackArtist">{track.artists.map(a => a.name).join(", ")}</div>
                                </div>
                                <button
                                    className="btn btn-sm primary-bottom"
                                    onClick={() => handleRequest(track)}
                                    disabled={requestingId === track.id || requestedIds.includes(track.id)}
                                >
                                    {requestingId === track.id
                                        ? <div className="spinner-border spinner-border-sm" role="status" />
                                        : requestedIds.includes(track.id)
                                            ? <i className="bi bi-check-lg" />
                                            : <i className="bi bi-plus-lg" />
                                    }
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* TOPS */}
            <div className="mb-4">
                <h6 className="fw-bold mb-3">Canciones más sonadas</h6>
                {topsLoading ? (
                    <div className="text-center py-3">
                        <div className="spinner-border spinner-border-sm" role="status" />
                    </div>
                ) : (
                    topTracks.map((track, index) => (
                        <div id="topSong-card" className="mb-1" key={index}>
                            <img
                                id="topSongCover"
                                src={track.album?.images?.[2]?.url || track.album?.images?.[0]?.url}
                                alt={track.name}
                            />
                            <div id="topSongTrackInfo">
                                <div id="topSongTrackTitle">{track?.name}</div>
                                <div id="topSongTrackArtist">{track.artists.map(a => a.name).join(", ")}</div>
                            </div>
                            <button
                                className="btn btn-sm primary-bottom"
                                onClick={() => handleRequest(track)}
                                disabled={requestingId === track.id || requestedIds.includes(track.id)}
                            >
                                {requestingId === track.id
                                    ? <div className="spinner-border spinner-border-sm" role="status" />
                                    : requestedIds.includes(track.id)
                                        ? <i className="bi bi-check-lg" />
                                        : <i className="bi bi-plus-lg" />
                                }
                            </button>
                        </div>
                    ))
                )}
            </div>
            <div>
                <h6 className="fw-bold mb-3">Artistas más frecuentes</h6>
                {topsLoading ? (
                    <div className="text-center py-3">
                        <div className="spinner-border spinner-border-sm" role="status" />
                    </div>
                ) : (
                    <div className="row d-flex justify-content-around">
                        {topArtists.map(artist => (
                            <div className="col-3 col-md-1 mb-2" key={artist.id}>
                                <div className="ratio ratio-1x1">
                                    <img
                                        className="img-fluid rounded-circle object-fit-cover"
                                        src={artist.images?.[2]?.url || artist.images?.[0]?.url}
                                        alt={artist.name}
                                    />
                                </div>
                                <div className="text-center" style={{ fontSize: "10px" }}>{artist.name}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* Modal de alerta */}
            {alertModal && (
                <div style={{
                    position: "fixed", inset: 0, background: "#00000099",
                    display: "flex", alignItems: "flex-end", zIndex: 1000, marginBlockEnd: 65
                }}>
                    <div style={{
                        background: "var(--secondary)", borderRadius: "16px 16px 0 0",
                        padding: "24px", width: "100%"
                    }}>
                        <div className="text-center mb-3">
                            <i className={`bi ${alertModal.icon} fs-1`} style={{ color: "var(--warning)" }} />
                            <p className="fw-bold mt-2 mb-0">{alertModal.msg}</p>
                            {alertModal.submsg && (
                                <p className="fw-bold mb-1">
                                    {alertModal.submsg}
                                </p>
                            )}
                            <p style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
                                No puedes pedir esta canción en este momento
                            </p>
                        </div>
                        <button
                            className="btn secondary-bottom w-100"
                            onClick={() => setAlertModal(null)}
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}