import { useEffect, useState } from "react"
import { fetchMyRequests, deleteRequest } from "../services/backEndServices"

export const Requests = () => {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) return
        fetchMyRequests(token).then(data => {
            if (!Array.isArray(data)) return
            setRequests(data)
            setLoading(false)
        })
    }, [requests])

    const statusBadge = (status, rejectMessage) => {
        if (status === "pending") return (
            <span className="badge-pending">
                <i className="bi bi-clock me-1" />Pendiente
            </span>
        )
        if (status === "accepted") return (
            <span className="badge-accepted">
                <i className="bi bi-check-circle me-1" />Aceptada
            </span>
        )
        if (status === "rejected") return (
            <div className="d-flex flex-column align-items-end gap-1">
                <span className="badge-rejected">
                    <i className="bi bi-x-circle me-1" />Rechazada
                </span>
                {rejectMessage && (
                    <span style={{ fontSize: "11px", color: "var(--destructive)" }}>
                        {rejectMessage}
                    </span>
                )}
            </div>
        )
    }

    const pending = requests.filter(r => r.status === "pending")
    const accepted = requests.filter(r => r.status === "accepted")
    const rejected = requests.filter(r => r.status === "rejected")

    const handleDelete = async (id) => {
        const token = localStorage.getItem("token")
        if (!token) return
        await deleteRequest(id, token)
        setRequests(prev => prev.filter(r => r.id !== id))
    }

    return (
        <div className="container-fluid">
            <div className="p-2 rounded-3 mb-3" style={{ background: "var(--card)" }}>
                <h1 className="fw-bold">Mis Peticiones</h1>
                <h6>Revisa el estado de las canciones que has pedido para que suenen en el pub.</h6>
            </div>

            {loading ? (
                <div className="text-center py-4">
                    <div className="spinner-border spinner-border-sm" role="status" />
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center text-muted py-4">No has pedido ninguna canción todavía</div>
            ) : (
                <>
                    {pending.length > 0 && (
                        <div className="mb-4">
                            <h6 className="fw-bold mb-2">
                                <i className="bi bi-clock me-2" style={{ color: "var(--warning)" }} />
                                Pendientes
                            </h6>
                            {pending.map(req => (
                                <div className="request-card mb-2" key={req.id}>
                                    <img className="request-cover" src={req.album_image} alt={req.track_name} />
                                    <div className="request-track-info">
                                        <div className="request-track-title">{req.track_name}</div>
                                        <div className="request-track-artist">{req.artist_name}</div>
                                    </div>
                                    <div className="d-flex flex-column align-items-center gap-1">
                                        {statusBadge(req.status, req.reject_message)}
                                        <button
                                            className="btn btn-sm"
                                            style={{ color: "var(--destructive)", fontSize: "11px", padding: "0" }}
                                            onClick={() => handleDelete(req.id)}
                                        >
                                            <i className="bi bi-trash me-1" />Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {accepted.length > 0 && (
                        <div className="mb-4">
                            <h6 className="fw-bold mb-2">
                                <i className="bi bi-check-circle me-2" style={{ color: "var(--success)" }} />
                                Aceptadas
                            </h6>
                            {accepted.map(req => (
                                <div className="request-card mb-2" key={req.id}>
                                    <img className="request-cover" src={req.album_image} alt={req.track_name} />
                                    <div className="request-track-info">
                                        <div className="request-track-title">{req.track_name}</div>
                                        <div className="request-track-artist">{req.artist_name}</div>
                                    </div>
                                    {statusBadge(req.status, req.reject_message)}
                                </div>
                            ))}
                        </div>
                    )}

                    {rejected.length > 0 && (
                        <div className="mb-4">
                            <h6 className="fw-bold mb-2">
                                <i className="bi bi-x-circle me-2" style={{ color: "var(--destructive)" }} />
                                Rechazadas
                            </h6>
                            {rejected.map(req => (
                                <div className="request-card mb-2" key={req.id}>
                                    <img className="request-cover" src={req.album_image} alt={req.track_name} />
                                    <div className="request-track-info">
                                        <div className="request-track-title">{req.track_name}</div>
                                        <div className="request-track-artist">{req.artist_name}</div>
                                    </div>
                                    {statusBadge(req.status, req.reject_message)}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}