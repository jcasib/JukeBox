import { useEffect, useState } from "react"
import { acceptRequest, rejectRequest, fetchPendingRequests, getRole } from "../services/backEndServices"
import useGlobalReducer from "../hooks/useGlobalReducer"

export const Moderator = () => {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [authorized, setAuthorized] = useState(null)
    const [rejectingId, setRejectingId] = useState(null)
    const [rejectMessage, setRejectMessage] = useState("")
    const [processingId, setProcessingId] = useState(null)

    const { store, dispatch } = useGlobalReducer()

    const formatTime = (isoString) => {
        const diff = Math.floor((new Date() - new Date(isoString)) / 1000)
        if (diff < 60) return "Ahora"
        if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`
        if (diff < 86400) return `Hace ${Math.floor(diff / 3600)}h`
        return `Hace ${Math.floor(diff / 86400)}d`
    }

    const checkRole = async () => {
        const role = await getRole()
        if (role === "mod" || role === "admin") {
            setAuthorized(true)
        } else {
            setAuthorized(false)
            setLoading(false)
        }
    }

    useEffect(() => {
        checkRole()
        const id = setInterval(checkRole, 60000)
        return () => clearInterval(id)
    }, [])

    useEffect(() => {
        if (!authorized) return

        const token = localStorage.getItem("token")

        // Carga inicial
        fetchPendingRequests(token).then(data => {
            setRequests(Array.isArray(data) ? data : [])
            setLoading(false)
        })

        // SSE — comentado por incompatibilidad con Gunicorn sync
        // const es = new EventSource(`${import.meta.env.VITE_BACKEND_URL}/api/moderator/events?token=${token}`)
        // es.onmessage = (e) => {
        //     const event = JSON.parse(e.data)
        //     if (event.type === "connected") return
        //     setRequests(prev => [...prev, event])
        // }
        // es.onerror = () => es.close()
        // return () => es.close()

        // Polling cada 15 segundos
        const id = setInterval(() => {
            fetchPendingRequests(token).then(data => {
                if (Array.isArray(data)) setRequests(data)
            })
        }, 15000)

        return () => clearInterval(id)
    }, [authorized])

    const refreshCount = async () => {
        const token = localStorage.getItem("token")
        const data = await fetchPendingRequests(token)
        if (Array.isArray(data)) {
            dispatch({ type: 'set_pending_count', payload: data.length })
        }
    }

    const handleAccept = async (id) => {
        const token = localStorage.getItem("token")
        setProcessingId(id)
        await acceptRequest(id, token)
        setRequests(prev => prev.filter(r => r.id !== id))
        refreshCount()  // 👈
        setProcessingId(null)
    }

    const handleReject = async () => {
        const token = localStorage.getItem("token")
        setProcessingId(rejectingId)
        await rejectRequest(rejectingId, rejectMessage, token)
        setRequests(prev => prev.filter(r => r.id !== rejectingId))
        setRejectingId(null)
        setRejectMessage("")
        setProcessingId(null)
        refreshCount()  // 👈
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
            <div className="p-2 rounded-3 mb-3 d-flex justify-content-between align-items-center" style={{ background: "var(--card)" }}>
                <div>
                    <h1 className="fw-bold mb-0">Nuevas Peticiones</h1>
                    <h6 className="mb-0">Acepta o rechaza las canciones pedidas</h6>
                </div>
                {requests.length > 0 && (
                    <span className="badge-pending">{requests.length} pendientes</span>
                )}
            </div>

            {requests.length === 0 ? (
                <div className="text-center text-muted py-4">
                    <i className="bi bi-check-circle fs-1" style={{ color: "var(--success)" }} />
                    <p className="mt-2">No hay peticiones pendientes</p>
                </div>
            ) : (
                requests.map(req => (
                    <div className="mod-card mb-3" key={req.id}>
                        <div className="request-card">
                            <img className="request-cover" src={req.album_image} alt={req.track_name} />
                            <div className="request-track-info">
                                <div className="request-track-title">{req.track_name}</div>
                                <div className="request-track-artist">{req.artist_name}</div>
                            </div>
                        </div>
                        <div className="d-flex justify-content-between px-1" style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
                            <span><i className="bi bi-person me-1" />{req.username}</span>
                            <span><i className="bi bi-clock me-1" />{formatTime(req.created_at)}</span>
                        </div>
                        <div className="d-flex gap-2">
                            <button
                                className="btn secondary-bottom flex-fill"
                                onClick={() => { setRejectingId(req.id); setRejectMessage("") }}
                                disabled={processingId === req.id}
                            >
                                <i className="bi bi-x me-1" />Rechazar
                            </button>
                            <button
                                className="btn primary-bottom flex-fill"
                                onClick={() => handleAccept(req.id)}
                                disabled={processingId === req.id}
                            >
                                {processingId === req.id
                                    ? <div className="spinner-border spinner-border-sm" role="status" />
                                    : <><i className="bi bi-check me-1" />Aceptar</>
                                }
                            </button>
                        </div>
                    </div>
                ))
            )}

            {/* Modal rechazo */}
            {rejectingId && (
                <div style={{
                    position: "fixed", inset: 0, background: "#00000099",
                    display: "flex", alignItems: "flex-end", zIndex: 1000, marginBlockEnd: 65
                }}>
                    <div style={{
                        background: "var(--secondary)", borderRadius: "16px 16px 0 0",
                        padding: "24px", width: "100%"
                    }}>
                        <h6 className="fw-bold mb-3">Motivo del rechazo</h6>
                        <input
                            type="text"
                            className="form-control mb-3"
                            style={{ background: "var(--input)", color: "var(--foreground)", border: "none" }}
                            placeholder="Escribe un motivo (opcional)..."
                            value={rejectMessage}
                            onChange={e => setRejectMessage(e.target.value)}
                        />
                        <div className="d-flex gap-2">
                            <button
                                className="btn secondary-bottom flex-fill"
                                onClick={() => { setRejectingId(null); setRejectMessage("") }}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn flex-fill"
                                style={{ background: "var(--destructive)", color: "var(--destructive-foreground)" }}
                                onClick={handleReject}
                                disabled={processingId === rejectingId}
                            >
                                {processingId === rejectingId
                                    ? <div className="spinner-border spinner-border-sm" role="status" />
                                    : "Confirmar rechazo"
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}