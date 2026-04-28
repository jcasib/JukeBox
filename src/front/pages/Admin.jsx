import { useEffect, useState } from "react"
import { fetchUsers, updateUserRole, deleteUser, getRole, muteUser, unmuteUser } from "../services/backEndServices"

export const Admin = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [authorized, setAuthorized] = useState(null)
    const [search, setSearch] = useState("")
    const [deletingId, setDeletingId] = useState(null)
    const [updatingId, setUpdatingId] = useState(null)
    const [confirmDeleteId, setConfirmDeleteId] = useState(null)
    const [mutingId, setMutingId] = useState(null)
    const [muteModalId, setMuteModalId] = useState(null)
    const [muteMinutes, setMuteMinutes] = useState(60)

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
            const data = await fetchUsers(token)
            setUsers(Array.isArray(data) ? data : [])
            setLoading(false)
        }
        init()
    }, [])

    const handleRoleChange = async (id, newRole) => {
        const token = localStorage.getItem("token")
        setUpdatingId(id)
        await updateUserRole(id, newRole, token)
        setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u))
        setUpdatingId(null)
    }

    const handleDelete = async (id) => {
        const token = localStorage.getItem("token")
        setDeletingId(id)
        await deleteUser(id, token)
        setUsers(prev => prev.filter(u => u.id !== id))
        setDeletingId(null)
    }

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    )

    const roleColor = (role) => {
        if (role === "admin") return "var(--destructive)"
        if (role === "mod") return "var(--primary)"
        return "var(--muted-foreground)"
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

    const handleMute = async (id) => {
        const token = localStorage.getItem("token")
        setMutingId(id)
        await muteUser(id, muteMinutes, token)
        setUsers(prev => prev.map(u => u.id === id ? {
            ...u,
            muted_until: new Date(Date.now() + muteMinutes * 60000).toISOString()
        } : u))
        setMutingId(null)
        setMuteModalId(null)
    }

    const handleUnmute = async (id) => {
        const token = localStorage.getItem("token")
        setMutingId(id)
        await unmuteUser(id, token)
        setUsers(prev => prev.map(u => u.id === id ? { ...u, muted_until: null } : u))
        setMutingId(null)
    }

    const isMuted = (user) => {
        return user.muted_until && new Date(user.muted_until) > new Date()
    }

    return (
        <div className="container-fluid">
            <div className="p-2 rounded-3 mb-3 d-flex justify-content-between align-items-center" style={{ background: "var(--card)" }}>
                <div>
                    <h1 className="fw-bold mb-0">Gestión de usuarios</h1>
                    <h6 className="mb-0">{users.length} usuarios registrados</h6>
                </div>
            </div>

            {/* Buscador */}
            <div className="position-relative mb-3 border rounded-pill px-3">
                <div className="d-flex gap-2 align-items-center">
                    <i className="bi bi-search fs-6" />
                    <input
                        className="form-control bg-transparent shadow-none p-2 border-0"
                        placeholder="Buscar por nombre o email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ color: "var(--foreground)" }}
                    />
                </div>
            </div>

            {filteredUsers.length === 0 ? (
                <div className="text-center text-muted py-4">No hay usuarios</div>
            ) : (
                filteredUsers.map(user => (
                    <div className="mod-card mb-2" key={user.id}>
                        <div className="d-flex align-items-center gap-3">
                            <div style={{
                                width: "42px", height: "42px", borderRadius: "50%",
                                background: "var(--primary)", display: "flex",
                                alignItems: "center", justifyContent: "center",
                                fontWeight: "700", color: "var(--primary-foreground)",
                                flexShrink: 0
                            }}>
                                {user.username[0].toUpperCase()}
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontWeight: "700", fontSize: "15px" }}>{user.username}</div>
                                <div style={{ fontSize: "12px", color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
                            </div>
                            <span style={{ fontSize: "12px", fontWeight: "600", color: roleColor(user.role), whiteSpace: "nowrap" }}>
                                {user.role}
                            </span>
                        </div>

                        <div className="d-flex gap-2 mt-2">
                            {user.role !== "admin" ? (
                                <>
                                    <select
                                        className="form-select form-select-sm flex-fill"
                                        style={{ background: "var(--input)", color: "var(--foreground)", border: "none" }}
                                        value={user.role}
                                        onChange={e => handleRoleChange(user.id, e.target.value)}
                                        disabled={updatingId === user.id}
                                    >
                                        <option value="user">User</option>
                                        <option value="mod">Mod</option>
                                    </select>
                                    <button
                                        className="btn btn-sm"
                                        style={{
                                            background: isMuted(user) ? "var(--warning)" : "var(--secondary)",
                                            color: isMuted(user) ? "var(--warning-foreground)" : "var(--foreground)"
                                        }}
                                        onClick={() => isMuted(user) ? handleUnmute(user.id) : setMuteModalId(user.id)}
                                        disabled={mutingId === user.id}
                                    >
                                        {mutingId === user.id
                                            ? <div className="spinner-border spinner-border-sm" role="status" />
                                            : <i className={`bi ${isMuted(user) ? "bi-mic" : "bi-mic-mute"}`} />
                                        }
                                    </button>
                                    <button
                                        className="btn btn-sm"
                                        style={{ background: "var(--destructive)", color: "var(--destructive-foreground)" }}
                                        onClick={() => setConfirmDeleteId(user.id)}
                                    >
                                        <i className="bi bi-trash" />
                                    </button>
                                </>
                            ) : (
                                <span style={{ fontSize: "12px", color: "var(--muted-foreground)", fontStyle: "italic" }}>
                                    Rol protegido
                                </span>
                            )}
                        </div>
                    </div>
                ))
            )}
            {confirmDeleteId && (
                <div style={{
                    position: "fixed", inset: 0, background: "#00000099",
                    display: "flex", alignItems: "flex-end", zIndex: 1000, marginBlockEnd: 65
                }}>
                    <div style={{
                        background: "var(--secondary)", borderRadius: "16px 16px 0 0",
                        padding: "24px", width: "100%"
                    }}>
                        <h6 className="fw-bold mb-2">¿Eliminar usuario?</h6>
                        <p style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
                            Esta acción no se puede deshacer.
                        </p>
                        <div className="d-flex gap-2">
                            <button
                                className="btn secondary-bottom flex-fill"
                                onClick={() => setConfirmDeleteId(null)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn flex-fill"
                                style={{ background: "var(--destructive)", color: "var(--destructive-foreground)" }}
                                onClick={() => { handleDelete(confirmDeleteId); setConfirmDeleteId(null) }}
                                disabled={deletingId === confirmDeleteId}
                            >
                                {deletingId === confirmDeleteId
                                    ? <div className="spinner-border spinner-border-sm" role="status" />
                                    : "Eliminar"
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {muteModalId && (
                <div style={{
                    position: "fixed", inset: 0, background: "#00000099",
                    display: "flex", alignItems: "flex-end", zIndex: 1000, marginBlockEnd: 65
                }}>
                    <div style={{
                        background: "var(--secondary)", borderRadius: "16px 16px 0 0",
                        padding: "24px", width: "100%"
                    }}>
                        <h6 className="fw-bold mb-3 text-center">¿Cuánto tiempo mutear?</h6>
                        <div className="d-flex gap-2 mb-3 flex-wrap justify-content-center">
                            {[15, 30, 60, 90, 120, 150, 180, 240, 360, 720].map(min => (
                                <button
                                    key={min}
                                    className="btn btn-sm"
                                    style={{
                                        background: muteMinutes === min ? "var(--primary)" : "var(--input)",
                                        color: muteMinutes === min ? "var(--primary-foreground)" : "var(--foreground)"
                                    }}
                                    onClick={() => setMuteMinutes(min)}
                                >
                                    {min < 60 ? `${min} min` : min < 1440 ? `${min / 60}h` : "1 día"}
                                </button>
                            ))}
                        </div>
                        <div className="d-flex gap-2">
                            <button
                                className="btn secondary-bottom flex-fill"
                                onClick={() => setMuteModalId(null)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn flex-fill"
                                style={{ background: "var(--warning)", color: "var(--warning-foreground)" }}
                                onClick={() => handleMute(muteModalId)}
                                disabled={mutingId === muteModalId}
                            >
                                {mutingId === muteModalId
                                    ? <div className="spinner-border spinner-border-sm" role="status" />
                                    : "Mutear"
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}