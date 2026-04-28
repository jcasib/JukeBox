import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { getRole } from "../../services/backEndServices";
import useGlobalReducer from "../../hooks/useGlobalReducer";

export const MobileNavbar = () => {

    const { store, dispatch } = useGlobalReducer()
    const [authorized, setAuthorized] = useState(false)
    const [pendingCount, setPendingCount] = useState(0)

    const checkRole = async () => {
        const role = await getRole()
        if (role === "mod" || role === "admin") {
            setAuthorized(true)
        } else {
            setAuthorized(false)
        }
    }

    useEffect(() => {
        checkRole()
        const id = setInterval(checkRole, 30000)
        return () => clearInterval(id)
    }, [])

    useEffect(() => {
        if (!authorized) return

        const token = localStorage.getItem("token")

        // Carga inicial
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/moderator/requests`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) dispatch({ type: 'set_pending_count', payload: data.length })
            })

        // SSE — comentado por incompatibilidad con Gunicorn sync
        // const es = new EventSource(`${import.meta.env.VITE_BACKEND_URL}/api/moderator/events?token=${token}`)
        // es.onmessage = (e) => {
        //     const event = JSON.parse(e.data)
        //     if (event.type === "connected") return
        //     dispatch({ type: 'set_pending_count', payload: store.pendingCount + 1 })
        // }
        // es.onerror = () => es.close()
        // return () => es.close()

        // Polling cada 30 segundos
        const id = setInterval(() => {
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/moderator/requests`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(r => r.json())
                .then(data => {
                    if (Array.isArray(data)) dispatch({ type: 'set_pending_count', payload: data.length })
                })
        }, 30000)

        return () => clearInterval(id)
    }, [authorized])

    return (
        <nav className="sidebar fixed-bottom d-lg-none">
            <div className="container-fluid">

                <div className="nav d-flex justify-content-around w-100">
                    {/* Home */}
                    <NavLink to="/" end className="btn text-center fs-2">
                        <i className="bi bi-house-door"></i>
                        <span className="d-block" style={{ fontSize: "0.65rem" }}>Inicio</span>
                    </NavLink>

                    {/* Search */}
                    <NavLink to="/search" className="btn text-center fs-2">
                        <i className="bi bi-search"></i>
                        <span className="d-block" style={{ fontSize: "0.65rem" }}>Buscar</span>
                    </NavLink>

                    {/* Request */}
                    <NavLink to="/requests" className="btn text-center fs-2" >
                        <i className="bi bi-music-note-list"></i>
                        <span className="d-block" style={{ fontSize: "0.65rem" }}>Peticiones</span>
                    </NavLink>

                    {/* MOD */}
                    {authorized && (
                        <NavLink to="/mod" className="btn text-center fs-2" style={{ position: "relative" }}>
                            <i className="bi bi-shield-check"></i>
                            {store.pendingCount > 0 && (
                                <span style={{
                                    position: "absolute", top: "4px", right: "4px",
                                    width: "10px", height: "10px",
                                    borderRadius: "50%", background: "var(--destructive)"
                                }} />
                            )}
                            <span className="d-block" style={{ fontSize: "0.65rem" }}>Moderador</span>
                        </NavLink>
                    )}

                    {/* Settings
                    <NavLink to="/app/profile" className="btn text-center px-3">
                        <i className="bi bi-gear"></i>
                    </NavLink> */}

                </div>
            </div>
        </nav>
    );
};