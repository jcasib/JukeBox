import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { getRole } from "../services/backEndServices"
import logo from "../assets/img/Jukebox_logo.png"

export const TopBar = () => {
    const [role, setRole] = useState(null)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)
    const navigate = useNavigate()

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) return
        getRole().then(r => setRole(r))
    }, [])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleLogout = () => {
        localStorage.removeItem("token")
        setDropdownOpen(false)
        navigate("/auth")
    }

    const token = localStorage.getItem("token")

    return (
        <div style={{
            background: "var(--sidebar)",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--border)"
        }}>
            {/* Logo y nombre */}
            <div className="d-flex align-items-center gap-2">
                <img src={logo} alt="Jukebox" style={{ width: "50px", height: "50px", objectFit: "contain", mixBlendMode: "screen" }} />
                <div className="d-flex align-items-end gap-1">
                    <span className="fw-bold" style={{ fontSize: "20px" }}>Jukebox</span>
                    <span className="fw-bold" style={{ fontSize: "10px" }}>from Wembley</span>
                </div>

            </div>

            {/* Control de usuario */}
            {token ? (
                <div style={{ position: "relative" }} ref={dropdownRef}>
                    <button
                        className="btn"
                        style={{ color: "var(--foreground)", fontSize: "22px", padding: "4px 8px" }}
                        onClick={() => setDropdownOpen(prev => !prev)}
                    >
                        <i className="bi bi-person-circle" />
                    </button>

                    {dropdownOpen && (
                        <div style={{
                            position: "absolute", right: 0, top: "110%",
                            background: "var(--secondary)", borderRadius: "var(--radius-md)",
                            minWidth: "180px", zIndex: 1000, overflow: "hidden",
                            boxShadow: "0 4px 20px #00000040"
                        }}>
                            {role === "admin" && (
                                <>
                                    <button
                                        className="btn w-100 text-start px-3 py-2"
                                        style={{ color: "var(--foreground)", borderRadius: 0 }}
                                        onClick={() => { navigate("/admin"); setDropdownOpen(false) }}
                                    >
                                        <i className="bi bi-people me-2" />Gestión de usuarios
                                    </button>
                                    <button
                                        className="btn w-100 text-start px-3 py-2"
                                        style={{ color: "var(--foreground)", borderRadius: 0 }}
                                        onClick={() => { navigate("/player"); setDropdownOpen(false) }}
                                    >
                                        <i className="bi bi-spotify me-2" />Panel de Spotify
                                    </button>
                                    <div style={{ height: "1px", background: "var(--border)" }} />
                                </>
                            )}
                            <button
                                className="btn w-100 text-start px-3 py-2"
                                style={{ color: "var(--destructive)", borderRadius: 0 }}
                                onClick={handleLogout}
                            >
                                <i className="bi bi-box-arrow-right me-2" />Cerrar sesión
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <button
                    className="btn primary-bottom btn-sm"
                    onClick={() => navigate("/auth")}
                >
                    Iniciar sesión
                </button>
            )}
        </div>
    )
}