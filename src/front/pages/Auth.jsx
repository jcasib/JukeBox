import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { login, register } from "../services/backEndServices"
import logo from "../assets/img/Jukebox_logo.png"

export const Auth = () => {
    const [tab, setTab] = useState("login")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [username, setUsername] = useState("")
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(null)
    const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)

    const navigate = useNavigate()

    const handleLogin = async () => {
        setError(null)
        setLoading(true)
        const data = await login(email, password)
        setLoading(false)
        if (data.error) {
            setError(data.error)
            return
        }
        localStorage.setItem("token", data.token)
        navigate("/")
    }

    const handleRegister = async () => {
        if (!acceptedPrivacy) {
            setError("Debes aceptar la política de privacidad para registrarte")
            return
        }
        setError(null)
        setLoading(true)
        const data = await register(email, password, username)
        setLoading(false)
        if (data.error) {
            setError(data.error)
            return
        }
        setTab("login")
        setError(null)
        setEmail("")
        setPassword("")
        setUsername("")
        setSuccess("¡Cuenta creada correctamente! Ya puedes iniciar sesión.")
    }

    return (
        <div style={{
            minHeight: "100vh",
            background: "var(--background)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px"
        }}>
            <div style={{ width: "100%", maxWidth: "400px" }}>
                <div className="text-center mb-4">
                    <img src={logo} style={{ width: "120px" }} />
                    <h1 className="fw-bold mt-2">Jukebox</h1>
                    <p style={{ color: "var(--muted-foreground)" }}>Pide música en segundos</p>
                </div>

                {/* Tabs */}
                <div className="d-flex mb-4" style={{ background: "var(--secondary)", borderRadius: "999px", padding: "4px" }}>
                    <button
                        className="btn flex-fill"
                        style={{
                            borderRadius: "999px",
                            background: tab === "login" ? "var(--primary)" : "transparent",
                            color: tab === "login" ? "var(--primary-foreground)" : "var(--muted-foreground)"
                        }}
                        onClick={() => { setTab("login"); setError(null); setSuccess(null); setAcceptedPrivacy(false) }}
                    >
                        Iniciar sesión
                    </button>
                    <button
                        className="btn flex-fill"
                        style={{
                            borderRadius: "999px",
                            background: tab === "register" ? "var(--primary)" : "transparent",
                            color: tab === "register" ? "var(--primary-foreground)" : "var(--muted-foreground)"
                        }}
                        onClick={() => { setTab("register"); setError(null); setSuccess(null); setAcceptedPrivacy(false) }}
                    >
                        Registrarse
                    </button>
                </div>

                {/* Formulario */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {tab === "register" && (
                        <input
                            type="text"
                            className="form-control auth-input"
                            placeholder="Nombre de usuario"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                        />
                    )}
                    <input
                        type="email"
                        className="form-control auth-input"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        className="form-control auth-input"
                        placeholder="Contraseña"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && (tab === "login" ? handleLogin() : handleRegister())}
                    />
                    {tab === "register" && (
                        <div className="text-center" style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
                            <i className="bi bi-info-circle me-1" />
                            Usa una contraseña única que no uses en otros sitios
                        </div>
                    )}

                    {error && (
                        <div style={{ color: "var(--destructive)", fontSize: "13px", textAlign: "center" }}>
                            <i className="bi bi-exclamation-circle me-1" />{error}
                        </div>
                    )}

                    {success && (
                        <div style={{ color: "var(--success)", fontSize: "13px", textAlign: "center" }}>
                            <i className="bi bi-check-circle me-1" />{success}
                        </div>
                    )}

                    {tab === "register" && (
                        <div className="d-flex align-items-center gap-2" style={{ fontSize: "13px" }}>
                            <input
                                type="checkbox"
                                id="privacy"
                                checked={acceptedPrivacy}
                                onChange={e => setAcceptedPrivacy(e.target.checked)}
                                style={{ width: "16px", height: "16px", accentColor: "var(--primary)", flexShrink: 0 }}
                            />
                            <label htmlFor="privacy" style={{ color: "var(--muted-foreground)", cursor: "pointer" }}>
                                He leído y acepto la{" "}
                                <a href="/privacy" target="_blank" style={{ color: "var(--primary)" }}>
                                    política de privacidad
                                </a>
                            </label>
                        </div>
                    )}

                    <button
                        className="btn primary-bottom w-100"
                        style={{ padding: "14px" }}
                        onClick={tab === "login" ? handleLogin : handleRegister}
                        disabled={loading}
                    >
                        {loading
                            ? <div className="spinner-border spinner-border-sm" role="status" />
                            : tab === "login" ? "Entrar" : "Crear cuenta"
                        }
                    </button>
                </div>
            </div>
        </div>
    )
}