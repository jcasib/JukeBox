import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { login, register } from "../services/backEndServices"

export const Auth = () => {
    const [tab, setTab] = useState("login")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [username, setUsername] = useState("")
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
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
                    <i className="bi bi-music-note-beamed" style={{ fontSize: "48px", color: "var(--primary)" }} />
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
                        onClick={() => { setTab("login"); setError(null) }}
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
                        onClick={() => { setTab("register"); setError(null) }}
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

                    {error && (
                        <div style={{ color: "var(--destructive)", fontSize: "13px", textAlign: "center" }}>
                            <i className="bi bi-exclamation-circle me-1" />{error}
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