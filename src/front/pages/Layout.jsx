import { useState, useEffect } from "react"
import { Outlet, Navigate } from "react-router-dom/dist"
import ScrollToTop from "../components/ScrollToTop"
import { MobileNavbar } from "../components/Navbar/MobileNavbar"
import { TopBar } from "../components/TopBar"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

export const Layout = () => {
    const token = localStorage.getItem("token")
    const [showPrivacyModal, setShowPrivacyModal] = useState(false)

    useEffect(() => {
        if (!token) return
        fetch(`${BACKEND_URL}/api/get_user`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(user => {
                if (!user.accepted_privacy) setShowPrivacyModal(true)
            })
    }, [])

    const handleAcceptPrivacy = async () => {
        await fetch(`${BACKEND_URL}/api/accept-privacy`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` }
        })
        setShowPrivacyModal(false)
    }

    if (!token) return <Navigate to="/auth" replace />

    return (
        <ScrollToTop>
            <TopBar />
            <div className="flex-grow-1 overflow-auto p-3 pb-5 pb-lg-2 mb-5">
                <Outlet />
            </div>
            <div className="d-lg-none">
                <MobileNavbar />
            </div>

            {showPrivacyModal && (
                <div style={{
                    position: "fixed", inset: 0, background: "#000000cc",
                    display: "flex", alignItems: "flex-end", zIndex: 2000
                }}>
                    <div style={{
                        background: "var(--secondary)", borderRadius: "16px 16px 0 0",
                        padding: "24px", width: "100%"
                    }}>
                        <h6 className="fw-bold mb-2">Actualizacion de privacidad</h6>
                        <p style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
                            Hemos actualizado nuestra politica de privacidad. Para continuar usando Jukebox necesitas aceptarla.
                        </p>
                        <a href="/privacy" target="_blank" style={{ fontSize: "13px", color: "var(--primary)", display: "block", marginBottom: "16px" }}>
                            Leer politica de privacidad
                        </a>
                        <button
                            className="btn primary-bottom w-100"
                            onClick={handleAcceptPrivacy}
                        >
                            Acepto la politica de privacidad
                        </button>
                    </div>
                </div>
            )}
        </ScrollToTop>
    )
}